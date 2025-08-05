from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Enhanced admin interface for User model with comprehensive features
    """
    list_display = ('username', 'email', 'get_full_name', 'is_active', 'is_staff', 'post_count', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'bio')
    ordering = ('-date_joined',)
    list_per_page = 25
    list_editable = ('is_active',)
    readonly_fields = ('date_joined', 'last_login', 'created_at', 'updated_at')
    
    def post_count(self, obj):
        """Display number of posts by user"""
        return obj.post_set.count()
    post_count.short_description = 'Posts'
    post_count.admin_order_field = 'post_count'
    
    # Fields to display in the admin form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'bio', 'profile_image', 'date_of_birth', 'phone_number')}),
        ('Social Media', {'fields': ('website', 'twitter', 'linkedin')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Fields to display when adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )
