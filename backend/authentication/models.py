from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import os


class User(AbstractUser):
    """
    Custom User model for Wrytera
    Extends Django's AbstractUser to add custom fields
    """
    
    # Custom fields
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)  # Keep for backward compatibility
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True,
        help_text='Upload a profile image (JPG, PNG, WebP)'
    )
    date_of_birth = models.DateField(blank=True, null=True)
    
    # Phone number with validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True, null=True)
    
    # Social media links
    website = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    
    # Password reset fields
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    reset_token_expires = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email should be unique
    email = models.EmailField(unique=True)
    
    # Username validation
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores.'
            )
        ]
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def save(self, *args, **kwargs):
        """Override save method"""
        super().save(*args, **kwargs)
        
        # TODO: Re-enable image resizing when PIL is properly installed
        # Image processing temporarily disabled due to PIL import issues
        pass
    
    @property
    def profile_image_url(self):
        """Return the profile image URL or None"""
        if self.profile_image:
            return self.profile_image.url
        return None
