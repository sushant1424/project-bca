from rest_framework import serializers
from .models import Post, Comment, Follow, Repost, Category, SavedPost, PostView
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
            'id', 'title', 'content', 'excerpt', 'image', 'author', 
            'created_at', 'like_count', 'comment_count', 'saved_count', 'view_count', 'unique_view_count',
            'is_liked', 'is_saved', 'is_following_author', 'comments', 'views', 'category', 'is_published'
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
        return obj.view_count()
    
    def get_unique_view_count(self, obj):
        """Return unique view count (distinct users + distinct IPs)"""
        return obj.unique_view_count()
    
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
    class Meta:
        model = Post
        fields = ['title', 'content', 'excerpt', 'image', 'category', 'is_published']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

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