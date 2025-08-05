from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
import re

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Includes password validation and confirmation
    """
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def validate_username(self, value):
        """Validate username format and uniqueness"""
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(
                'Username can only contain letters, numbers, and underscores.'
            )
        
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        
        return value
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        
        # Check for uppercase letter
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter.')
        
        # Check for lowercase letter
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError('Password must contain at least one lowercase letter.')
        
        # Check for number
        if not re.search(r'\d', value):
            raise serializers.ValidationError('Password must contain at least one number.')
        
        # Check for special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError('Password must contain at least one special character.')
        
        # Use Django's built-in password validation
        validate_password(value)
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError("Passwords don't match.")
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with hashed password"""
        validated_data.pop('confirm_password')  # Remove confirm_password from data
        
        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    Validates email and password
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate user credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Try to authenticate user
            user = authenticate(username=email, password=password)
            
            if not user:
                # If email authentication fails, try with username
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data (read-only for security)
    """
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'avatar', 'profile_image', 'profile_image_url', 'created_at', 'is_staff', 'is_superuser', 'is_active']
        read_only_fields = ['id', 'created_at', 'profile_image_url', 'is_staff', 'is_superuser']
    
    def get_profile_image_url(self, obj):
        """Return the full URL for the profile image"""
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for admin dashboard with calculated fields
    """
    profile_image_url = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    saved_posts_count = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'avatar', 'profile_image', 'profile_image_url', 
            'date_joined', 'created_at', 'is_staff', 'is_superuser', 'is_active',
            'posts_count', 'saved_posts_count'
        ]
        read_only_fields = [
            'id', 'date_joined', 'created_at', 'profile_image_url', 
            'is_staff', 'is_superuser', 'posts_count', 'saved_posts_count'
        ]
    
    def get_profile_image_url(self, obj):
        """Return the full URL for the profile image"""
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None
    
    def get_posts_count(self, obj):
        """Return the number of posts by this user"""
        return obj.posts.count()
    
    def get_saved_posts_count(self, obj):
        """Return the number of posts saved by this user"""
        return obj.saved_posts.count()
    
    def get_full_name(self, obj):
        """Return the user's full name or username if no name available"""
        return obj.get_full_name()