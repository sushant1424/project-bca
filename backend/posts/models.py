from django.db import models
from django.conf import settings
from django.utils import timezone

class Category(models.Model):
    """Category model for post categorization"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color code
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        db_table = 'categories'
    
    def __str__(self):
        return self.name

class Post(models.Model):
    """Post model for user-created content"""
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)  # Short preview
    image = models.URLField(blank=True, null=True)  # Optional featured image
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    views = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'posts'
    
    def __str__(self):
        return f"{self.title} by {self.author.username}"
    
    def like_count(self):
        return self.likes.count()
    
    def comment_count(self):
        return self.comments.count()
    
    def view_count(self):
        """Get accurate view count from PostView model"""
        try:
            return self.post_views.count()
        except Exception:
            # Fallback to old views field if PostView table doesn't exist yet
            return self.views
    
    def unique_view_count(self):
        """Get unique view count (distinct users + distinct IPs for anonymous)"""
        try:
            from django.db.models import Q, Count
            # Count unique authenticated users
            user_views = self.post_views.filter(user__isnull=False).values('user').distinct().count()
            # Count unique anonymous IPs
            anonymous_views = self.post_views.filter(user__isnull=True).values('ip_address').distinct().count()
            return user_views + anonymous_views
        except Exception:
            # Fallback to old views field if PostView table doesn't exist yet
            return self.views

class Comment(models.Model):
    """Comment model for post interactions"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_comments', blank=True)
    
    class Meta:
        ordering = ['created_at']
        db_table = 'comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"
    
    def like_count(self):
        return self.likes.count()

class Follow(models.Model):
    """Follow model for user relationships"""
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['follower', 'following']
        db_table = 'follows'
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class Repost(models.Model):
    """Repost model for sharing posts"""
    original_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reposts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reposts')
    comment = models.TextField(blank=True)  # Optional comment when reposting
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['original_post', 'user']
        db_table = 'reposts'
    
    def __str__(self):
        return f"{self.user.username} reposted {self.original_post.title}"

class PostView(models.Model):
    """PostView model to track individual post views for accurate counting"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='viewed_posts', null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # For anonymous users
    user_agent = models.TextField(blank=True)  # To help identify unique anonymous users
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'post_views'
        ordering = ['-viewed_at']
        # Add indexes for better performance
        indexes = [
            models.Index(fields=['post', 'user']),
            models.Index(fields=['post', 'ip_address']),
            models.Index(fields=['viewed_at']),
        ]
    
    def __str__(self):
        if self.user:
            return f"{self.user.username} viewed {self.post.title}"
        return f"Anonymous ({self.ip_address}) viewed {self.post.title}"

class SavedPost(models.Model):
    """SavedPost model for user's saved posts library"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_posts')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'user']
        db_table = 'saved_posts'
        ordering = ['-saved_at']
    
    def __str__(self):
        return f"{self.user.username} saved {self.post.title}"