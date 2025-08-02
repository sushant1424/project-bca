from rest_framework import serializers
from .models import Post, Comment, Follow, Repost, Category, SavedPost
from authentication.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'color', 'post_count']
    
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

class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts"""
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_following_author = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'excerpt', 'image', 'author', 
            'created_at', 'like_count', 'comment_count', 'is_liked',
            'is_following_author', 'comments', 'views', 'category'
        ]
        read_only_fields = ['author', 'created_at', 'views']
    
    def get_like_count(self, obj):
        return obj.like_count()
    
    def get_comment_count(self, obj):
        return obj.comment_count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
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