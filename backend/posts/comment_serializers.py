from rest_framework import serializers
from .models import Comment
from authentication.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments with reply support"""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'like_count', 'is_liked', 'replies', 'parent_id']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Get nested replies for this comment"""
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    def get_like_count(self, obj):
        """Get the number of likes for this comment"""
        return obj.like_count()
    
    def get_is_liked(self, obj):
        """Check if current user has liked this comment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def create(self, validated_data):
        """Create a new comment or reply"""
        parent_id = validated_data.pop('parent_id', None)
        parent = None
        
        if parent_id:
            try:
                parent = Comment.objects.get(id=parent_id)
                validated_data['parent'] = parent
            except Comment.DoesNotExist:
                raise serializers.ValidationError({'parent_id': 'Invalid parent comment ID'})
        
        return super().create(validated_data)

class AdminCommentSerializer(serializers.ModelSerializer):
    """Admin serializer for comments with additional fields"""
    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()
    post_title = serializers.SerializerMethodField()
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    like_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author_name', 'author_email', 'post_title', 'post_id', 'created_at', 'updated_at', 'like_count']
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
        return "Unknown Author"
    
    def get_author_email(self, obj):
        return obj.author.email if obj.author else "Unknown Email"
    
    def get_post_title(self, obj):
        return obj.post.title if obj.post else "Unknown Post"
    
    def get_like_count(self, obj):
        return obj.like_count()
