from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import os
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    User registration endpoint
    Accepts: username, email, password, confirm_password
    Returns: user data and JWT token
    """
    try:
        # Validate and create user
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate both JWT and DRF tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Create or get DRF token
            token, created = Token.objects.get_or_create(user=user)
            
            # Return user data and token
            user_data = UserSerializer(user).data
            return Response({
                'message': 'User registered successfully!',
                'user': user_data,
                'token': token.key,  # Use DRF token
                'jwt_token': str(access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        else:
            # Return validation errors
            return Response({
                'message': 'Registration failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'message': 'An error occurred during registration',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint
    Accepts: email, password
    Returns: user data and JWT token
    """
    try:
        # Validate login data
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate both JWT and DRF tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Create or get DRF token
            token, created = Token.objects.get_or_create(user=user)
            
            # Return user data and token
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Login successful!',
                'user': user_data,
                'token': token.key,  # Use DRF token
                'jwt_token': str(access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        else:
            # Return validation errors
            return Response({
                'message': 'Login failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'message': 'An error occurred during login',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update current user profile
    Requires: Authentication
    Returns: User data
    """
    try:
        user = request.user
        
        if request.method == 'GET':
            user_data = UserSerializer(user).data
            return Response({
                'user': user_data
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            # Update user profile
            data = request.data
            
            # Check if password change is requested
            if 'new_password' in data and data['new_password']:
                if not data.get('current_password'):
                    return Response({
                        'current_password': ['Current password is required to change password']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Verify current password
                if not check_password(data['current_password'], user.password):
                    return Response({
                        'current_password': ['Current password is incorrect']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(data['new_password'])
            
            # Update other fields
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.bio = data.get('bio', user.bio)
            user.website = data.get('website', user.website)
            user.phone_number = data.get('phone_number', user.phone_number)
            
            # Validate and save
            try:
                user.full_clean()
                user.save()
                
                # Return updated user data
                user_data = UserSerializer(user).data
                return Response({
                    'message': 'Profile updated successfully!',
                    'user': user_data
                }, status=status.HTTP_200_OK)
                
            except Exception as validation_error:
                return Response({
                    'message': 'Validation failed',
                    'errors': str(validation_error)
                }, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        return Response({
            'message': 'An error occurred while processing profile',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """
    Upload and update user profile image
    Requires: Authentication
    Accepts: profile_image file
    Returns: Updated user data with profile image URL
    """
    try:
        user = request.user
        
        # Check if image file is provided
        if 'profile_image' not in request.FILES:
            return Response({
                'message': 'No image file provided',
                'error': 'profile_image field is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['profile_image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response({
                'message': 'Invalid file type',
                'error': 'Only JPEG, PNG, and WebP images are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (5MB max)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            return Response({
                'message': 'File too large',
                'error': 'Image size must be less than 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old profile image if exists
        if user.profile_image:
            try:
                if os.path.isfile(user.profile_image.path):
                    os.remove(user.profile_image.path)
            except Exception as e:
                print(f"Error deleting old profile image: {e}")
        
        # Save new profile image
        user.profile_image = image_file
        user.save()
        
        # Return success response with updated user data
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Profile image uploaded successfully!',
            'user': user_data,
            'profile_image_url': user.profile_image_url
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'An error occurred while uploading image',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
