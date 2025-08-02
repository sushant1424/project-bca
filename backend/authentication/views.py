from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
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
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Return user data and token
            user_data = UserSerializer(user).data
            return Response({
                'message': 'User registered successfully!',
                'user': user_data,
                'token': str(access_token),
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
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Return user data and token
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Login successful!',
                'user': user_data,
                'token': str(access_token),
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

@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    Requires: Authentication
    Returns: User data
    """
    try:
        user = request.user
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'message': 'An error occurred while fetching profile',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
