from rest_framework import serializers
from .models import Post, Comment, Follow, Repost, Category, SavedPost, PostView, Notification
from authentication.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'color', 'post_count']
        extra_kwargs = {
            'slug': {'required': False},  # Make slug optional since we'll auto-generate it
            'description': {'required': False},
            'color': {'required': False},
        }
    
    def create(self, validated_data):
        # Auto-generate slug from name if not provided
        if 'slug' not in validated_data or not validated_data['slug']:
            from django.utils.text import slugify
            name = validated_data.get('name', '')
            if not name:
                raise serializers.ValidationError({'name': 'Name is required'})
            
            base_slug = slugify(name)
            if not base_slug:  # If slugify returns empty string
                base_slug = 'category'
            
            slug = base_slug
            counter = 1
            
            # Ensure slug is unique
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            validated_data['slug'] = slug
        
        return super().create(validated_data)
    
    def validate_name(self, value):
        """Validate category name"""
        if not value or not value.strip():
            raise serializers.ValidationError('Category name cannot be empty')
        
        # Check for duplicate names (case-insensitive)
        name = value.strip()
        if Category.objects.filter(name__iexact=name).exists():
            raise serializers.ValidationError(f'A category with the name "{name}" already exists')
        
        return name
    
    def get_post_count(self, obj):
        return obj.posts.count()

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'like_count', 'is_liked', 'parent']
        read_only_fields = ['author', 'created_at']
    
    def get_like_count(self, obj):
        return obj.like_count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class AdminCommentSerializer(serializers.ModelSerializer):
    """Serializer for comments in admin dashboard with post and post author info"""
    author = UserSerializer(read_only=True)  # Comment author (Made By)
    post = serializers.SerializerMethodField()  # Post info
    post_author = serializers.SerializerMethodField()  # Post author (Author)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'post', 'post_author', 'created_at']
        read_only_fields = ['author', 'created_at']
    
    def get_post(self, obj):
        """Return post information"""
        if obj.post:
            return {
                'id': obj.post.id,
                'title': obj.post.title,
                'slug': getattr(obj.post, 'slug', None)
            }
        return None
    
    def get_post_author(self, obj):
        """Return post author information"""
        if obj.post and obj.post.author:
            return UserSerializer(obj.post.author).data
        return None

class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts"""
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    saved_count = serializers.SerializerMethodField()
    view_count = serializers.SerializerMethodField()
    unique_view_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_following_author = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'excerpt', 'image', 'image_credit', 'author', 
            'created_at', 'like_count', 'comment_count', 'saved_count', 'view_count', 'unique_view_count',
            'is_liked', 'is_saved', 'is_following_author', 'comments', 'views', 'category', 'is_published',
            'is_premium', 'premium_price', 'premium_preview', 'allow_tips'
        ]
        read_only_fields = ['author', 'created_at', 'views', 'view_count', 'unique_view_count']
    
    def get_like_count(self, obj):
        return obj.like_count()
    
    def get_comment_count(self, obj):
        return obj.comment_count()
    
    def get_saved_count(self, obj):
        """Return the number of times this post has been saved by users"""
        return obj.saved_by.count()
    
    def get_view_count(self, obj):
        """Return accurate view count from PostView model"""
        try:
            return obj.view_count()
        except Exception:
            return getattr(obj, 'views', 0)
    
    def get_unique_view_count(self, obj):
        """Return unique view count (distinct users + distinct IPs)"""
        try:
            return obj.unique_view_count()
        except Exception:
            return getattr(obj, 'views', 0)
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_is_saved(self, obj):
        """Return whether the current user has saved this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False
    
    def get_is_following_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user, 
                following=obj.author
            ).exists()
        return False

class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts"""
    imageCredit = serializers.CharField(source='image_credit', required=False, allow_blank=True)
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'excerpt', 'image', 'imageCredit', 'category', 'is_published', 'is_premium', 'premium_price', 'premium_preview', 'allow_tips']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['author'] = request.user
            print(f"Setting author to: {request.user} (ID: {request.user.id})")
        else:
            print(f"ERROR: No authenticated user found in request context")
            print(f"Request: {request}")
            print(f"User: {getattr(request, 'user', 'No user attribute')}")
            raise serializers.ValidationError("Authentication required - no valid user found")
        
        print(f"Final validated_data before save: {validated_data}")
        return super().create(validated_data)

class PostViewSerializer(serializers.ModelSerializer):
    """Serializer for post views"""
    class Meta:
        model = PostView
        fields = ['id', 'user', 'post', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']

class FollowSerializer(serializers.ModelSerializer):
    """Serializer for follow relationships"""
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'following', 'created_at']

class RepostSerializer(serializers.ModelSerializer):
    """Serializer for reposts"""
    user = UserSerializer(read_only=True)
    original_post = PostSerializer(read_only=True)
    
    class Meta:
        model = Repost
        fields = ['id', 'original_post', 'user', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

class RepostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reposts"""
    class Meta:
        model = Repost
        fields = ['original_post', 'comment']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SavedPostSerializer(serializers.ModelSerializer):
    """Serializer for saved posts"""
    post = PostSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SavedPost
        fields = ['id', 'post', 'user', 'saved_at']
        read_only_fields = ['user', 'saved_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    sender = UserSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()
    related_object_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read', 
            'created_at', 'sender', 'time_ago', 'related_object_data', 'extra_data'
        ]
        read_only_fields = ['id', 'created_at', 'sender']
    
    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"
    
    def get_related_object_data(self, obj):
        """Get related object data based on notification type"""
        if not obj.related_object:
            return None
        
        if obj.notification_type in ['like', 'comment', 'trending'] and hasattr(obj.related_object, 'title'):
            # Post-related notifications
            return {
                'type': 'post',
                'id': obj.related_object.id,
                'title': obj.related_object.title,
                'slug': getattr(obj.related_object, 'slug', None)
            }
        elif obj.notification_type == 'comment' and hasattr(obj.related_object, 'content'):
            # Comment-related notifications
            return {
                'type': 'comment',
                'id': obj.related_object.id,
                'content': obj.related_object.content[:100] + '...' if len(obj.related_object.content) > 100 else obj.related_object.content
            }
        
        return None 