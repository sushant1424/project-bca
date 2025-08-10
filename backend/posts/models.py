from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import math

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
    image_credit = models.CharField(max_length=200, blank=True, help_text="Image credit/attribution")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    is_published = models.BooleanField(default=True)
    
    # Premium Content & Monetization Features
    is_premium = models.BooleanField(default=False, help_text="Mark as premium/paid content")
    premium_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Price for premium content")
    premium_preview = models.TextField(max_length=300, blank=True, help_text="Preview text for premium content")
    allow_tips = models.BooleanField(default=True, help_text="Allow readers to tip the author")
    
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
    
    def trending_score(self, decay_hours=24, lambda_decay=0.1):
        """
        Calculate time-weighted engagement score using exponential decay algorithm
        
        Formula: (weighted_engagement) × e^(-λ × hours_since_decay_start)
        
        Args:
            decay_hours: Hours after which engagement starts decaying (default: 24)
            lambda_decay: Decay rate - higher values = faster decay (default: 0.1)
        
        Returns:
            float: Trending score (higher = more trending)
        """
        # Get current engagement metrics
        likes = self.like_count()
        views = self.view_count()
        comments = self.comment_count()
        
        # Apply weighted scoring (comments are most valuable)
        weighted_engagement = (comments * 5) + (likes * 3) + (views * 1)
        
        # Calculate hours since post creation
        now = timezone.now()
        hours_since_post = (now - self.created_at).total_seconds() / 3600
        
        # Apply exponential decay only after decay_hours
        if hours_since_post <= decay_hours:
            # Fresh posts get full score (no decay)
            time_factor = 1.0
        else:
            # Apply exponential decay: e^(-λ × effective_hours)
            effective_hours = hours_since_post - decay_hours
            time_factor = math.exp(-lambda_decay * effective_hours)
        
        # Calculate final trending score
        trending_score = weighted_engagement * time_factor
        
        return round(trending_score, 2)

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

class UserSubscription(models.Model):
    """User subscription model for premium content access"""
    subscriber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscribers')
    subscription_type = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('lifetime', 'Lifetime')
    ], default='monthly')
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['subscriber', 'author']
        db_table = 'user_subscriptions'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.subscriber.username} subscribed to {self.author.username}"

class Tip(models.Model):
    """Tip model for reader-to-writer monetary appreciation"""
    tipper = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tips_given')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tips_received')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='tips', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(max_length=500, blank=True, help_text="Optional message with the tip")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tips'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tipper.username} tipped ${self.amount} to {self.recipient.username}"

class PremiumAccess(models.Model):
    """Track individual premium post purchases"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='premium_access_entries')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='premium_access_entries')
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'post']
        db_table = 'premium_access'
        ordering = ['-purchased_at']
    
    def __str__(self):
        return f"{self.user.username} purchased {self.post.title}"

class CollaborativePost(models.Model):
    """Model for collaborative writing - multiple authors on one post"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='collaborators')
    collaborator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collaborative_posts')
    role = models.CharField(max_length=20, choices=[
        ('co_author', 'Co-Author'),
        ('editor', 'Editor'),
        ('reviewer', 'Reviewer')
    ], default='co_author')
    contribution_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Revenue share percentage")
    invited_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['post', 'collaborator']
        db_table = 'collaborative_posts'
        ordering = ['-invited_at']
    
    def __str__(self):
        return f"{self.collaborator.username} - {self.role} on {self.post.title}"

class ReaderMood(models.Model):
    """Track how posts make readers feel - unique engagement metric"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reader_moods')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_reactions')
    mood = models.CharField(max_length=20, choices=[
        ('inspired', '✨ Inspired'),
        ('informed', '🧠 Informed'),
        ('entertained', '😄 Entertained'),
        ('moved', '❤️ Emotionally Moved'),
        ('motivated', '💪 Motivated'),
        ('thoughtful', '🤔 Made Me Think'),
        ('happy', '😊 Happy'),
        ('surprised', '😲 Surprised')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'user']
        db_table = 'reader_moods'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} felt {self.mood} reading {self.post.title}"

class WritingGoal(models.Model):
    """Writing goals for gamification"""
    GOAL_TYPES = [
        ('words', 'Word Count'),
        ('posts', 'Number of Posts'),
        ('followers', 'Follower Count'),
        ('revenue', 'Revenue Target'),
        ('engagement', 'Engagement Rate'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='writing_goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    target_value = models.PositiveIntegerField(help_text="Target number to achieve")
    current_value = models.PositiveIntegerField(default=0, help_text="Current progress")
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    reward_description = models.CharField(max_length=300, blank=True, help_text="What user gets for completing this goal")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'writing_goals'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s {self.get_goal_type_display()} Goal: {self.title}"
    
    @property
    def progress_percentage(self):
        """Calculate progress as percentage"""
        if self.target_value == 0:
            return 0
        return min(100, (self.current_value / self.target_value) * 100)
    
    @property
    def is_completed(self):
        """Check if goal is completed"""
        return self.current_value >= self.target_value
    
    def update_progress(self, new_value):
        """Update progress and mark as completed if target reached"""
        self.current_value = new_value
        if self.is_completed and self.status == 'active':
            self.status = 'completed'
            self.completed_at = timezone.now()
        self.save()


class Notification(models.Model):
    """Real-time notification system"""
    NOTIFICATION_TYPES = [
        ('like', 'Post Liked'),
        ('comment', 'New Comment'),
        ('follow', 'New Follower'),
        ('save', 'Post Saved'),
        ('new_post', 'New Post from Followed User'),
        ('mention', 'Mentioned in Post'),
        ('post_published', 'Post Published'),
        ('goal_completed', 'Goal Completed'),
        ('tip_received', 'Tip Received'),
        ('subscription', 'New Subscription'),
        ('trending', 'Post is Trending'),
        ('system', 'System Notification'),
    ]
    
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Generic foreign key to link to any model (Post, Comment, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional data as JSON for flexibility
    extra_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]
    
    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save()
    
    @classmethod
    def create_notification(cls, recipient, notification_type, title, message, sender=None, related_object=None, extra_data=None):
        """Helper method to create notifications"""
        notification = cls(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            title=title,
            message=message,
            extra_data=extra_data or {}
        )
        
        if related_object:
            notification.content_type = ContentType.objects.get_for_model(related_object)
            notification.object_id = related_object.pk
        
        notification.save()
        return notification