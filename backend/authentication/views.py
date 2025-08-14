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
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from django.core.paginator import Paginator
from django.db.models import Q, Count
from PIL import Image
import os
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, AdminUserSerializer
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get current user data
    Requires: Authentication
    Returns: Current user data
    """
    try:
        user = request.user
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'message': 'An error occurred while fetching user data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_id(request, user_id):
    """
    Get user data by ID
    Accepts: user_id in URL
    Returns: User data
    """
    try:
        user = User.objects.get(id=user_id)
        user_data = UserSerializer(user).data
        return Response(user_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'An error occurred while fetching user data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """
    Get paginated list of users with search functionality
    Requires: Authentication (staff users only for admin)
    Query params: page, search
    Returns: Paginated user list
    """
    try:
        # Temporarily allow all authenticated users for demo
        # if not request.user.is_staff:
        #     return Response({
        #         'message': 'Access denied. Staff privileges required.'
        #     }, status=status.HTTP_403_FORBIDDEN)
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        search = request.GET.get('search', '').strip()
        page_size = 50  # Items per page - increased to show more users
        
        # Build queryset with search and optimize for admin dashboard
        queryset = User.objects.select_related().prefetch_related('posts', 'saved_posts').order_by('-date_joined')
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Paginate results
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize users with admin-specific data
        users_data = AdminUserSerializer(page_obj.object_list, many=True, context={'request': request}).data
        
        return Response({
            'results': users_data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'An error occurred while fetching users',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Delete a user (admin only)
    """
    try:
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'message': 'Access denied. Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent self-deletion
        if request.user.id == user_id:
            return Response({'message': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(id=user_id)
        
        # Soft delete approach - deactivate user instead of hard delete to avoid constraint issues
        user.is_active = False
        user.email = f"deleted_{user.id}_{user.email}"  # Prevent email conflicts
        user.username = f"deleted_{user.id}_{user.username}"  # Prevent username conflicts
        user.save()
        
        return Response({'message': 'User deactivated successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': 'Error deleting user', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """
    Update user status (admin only)
    """
    try:
        # Temporarily allow all authenticated users for demo
        # if not request.user.is_staff:
        #     return Response({'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        return Response({'message': 'User updated successfully', 'is_active': user.is_active}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': 'Error updating user', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Send password reset email
    Accepts: email
    Returns: Success message
    """
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            return Response({
                'message': 'If an account with this email exists, you will receive a password reset link.'
            }, status=status.HTTP_200_OK)
        
        # Generate reset token
        reset_token = get_random_string(32)
        user.reset_token = reset_token
        user.reset_token_expires = timezone.now() + timedelta(hours=1)
        user.save()
        
        # Send password reset email
        try:
            reset_url = f"http://localhost:5173/reset-password?token={reset_token}"
            subject = 'Reset Your Wrytera Password'
            message = f"""
Hi {user.first_name or user.username},

You requested to reset your password for your Wrytera account.

Click the link below to reset your password:
{reset_url}

Or copy and paste this reset token: {reset_token}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The Wrytera Team
            """
            
            # Send email (configure SMTP settings in Django settings)
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Password reset instructions have been sent to your email.',
                'email_sent': True
            }, status=status.HTTP_200_OK)
            
        except Exception as email_error:
            # If email fails, still return success for security (don't reveal email issues)
            print(f"Email sending failed: {email_error}")
            return Response({
                'message': 'Password reset instructions have been sent to your email.',
                'email_sent': False,
                'reset_token': reset_token  # Fallback for development
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'An error occurred while processing your request',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with token
    Accepts: token, new_password
    Returns: Success message
    """
    try:
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response({
                'message': 'Token and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(
                reset_token=token,
                reset_token_expires__gt=timezone.now()
            )
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid or expired reset token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset password
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.save()
        
        return Response({
            'message': 'Password reset successfully!'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'An error occurred while resetting password',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User logout endpoint
    Requires: Authentication
    Returns: Success message
    """
    try:
        # Delete the user's token to log them out
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        
        return Response({
            'message': 'Logged out successfully!'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'An error occurred during logout',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_admin(request):
    """
    Create a Django superuser/admin account
    Accepts: username, email, password, confirm_password
    Returns: success message and admin user data
    """
    try:
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')
        
        # Validation
        if not username or not email or not password:
            return Response({
                'error': 'Username, email, and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if password != confirm_password:
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(password) < 8:
            return Response({
                'error': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create superuser (admin)
        admin_user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        # Generate token for immediate login
        token, created = Token.objects.get_or_create(user=admin_user)
        
        return Response({
            'message': 'Admin account created successfully!',
            'user': {
                'id': admin_user.id,
                'username': admin_user.username,
                'email': admin_user.email,
                'is_staff': admin_user.is_staff,
                'is_superuser': admin_user.is_superuser
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Failed to create admin account',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
