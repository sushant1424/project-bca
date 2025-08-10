from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from posts.models import Post, Category
from posts.serializers import PostCreateSerializer, PostSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
import json
import traceback

@csrf_exempt
@require_http_methods(["POST"])
def debug_post_creation(request):
    """Debug endpoint for testing post creation"""
    try:
        # Parse JSON data
        data = json.loads(request.body)
        
        # Get or create a test user
        username = data.get('username', 'testuser')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=username,
                email=f'{username}@test.com',
                password='testpass123'
            )
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Mock request object
        class MockRequest:
            def __init__(self, user, data):
                self.user = user
                self.data = data
        
        mock_request = MockRequest(user, data)
        
        # Test serializer
        serializer = PostCreateSerializer(data=data, context={'request': mock_request})
        
        if serializer.is_valid():
            post = serializer.save()
            response_serializer = PostSerializer(post, context={'request': mock_request})
            return JsonResponse({
                'success': True,
                'post': response_serializer.data,
                'user': user.username,
                'token': token.key
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': serializer.errors,
                'data_received': data
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        })

@require_http_methods(["GET"])
def debug_info(request):
    """Debug endpoint for system information"""
    try:
        return JsonResponse({
            'users_count': User.objects.count(),
            'posts_count': Post.objects.count(),
            'categories_count': Category.objects.count(),
            'recent_posts': list(Post.objects.values('id', 'title', 'author__username')[:5]),
            'categories': list(Category.objects.values('id', 'name', 'slug')),
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        })
