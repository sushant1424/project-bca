from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import models
from .models import Post, Comment, Follow, Repost, Category, SavedPost
from .serializers import (
    PostSerializer, PostCreateSerializer, CommentSerializer,
    FollowSerializer, RepostSerializer, RepostCreateSerializer,
    CategorySerializer, SavedPostSerializer
)

# Custom pagination class
class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Post views
@api_view(['GET', 'POST'])
def post_list(request):
    """Get all posts or create a new post"""
    if request.method == 'GET':
        # Get all published posts, regardless of authentication status
        posts = Post.objects.filter(is_published=True).select_related('author').prefetch_related('likes', 'comments')
        
        # Apply pagination
        paginator = PostPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = PostCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def post_detail(request, pk):
    """Get, update, or delete a specific post"""
    post = get_object_or_404(Post, pk=pk)
    
    if request.method == 'GET':
        # Increment view count
        post.views += 1
        post.save()
        
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if not request.user.is_authenticated or post.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PostCreateSerializer(post, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated or post.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, pk):
    """Like or unlike a post"""
    post = get_object_or_404(Post, pk=pk)
    
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        return Response({'liked': False})
    else:
        post.likes.add(request.user)
        return Response({'liked': True})

# Comment views
@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
def comment_list(request, post_pk):
    """Get comments for a post or add a new comment"""
    try:
        post = get_object_or_404(Post, pk=post_pk)
        
        if request.method == 'GET':
            comments = Comment.objects.filter(post=post, parent=None).select_related('author')
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Create comment data
            comment_data = {
                'content': request.data.get('content', '').strip(),
                'post': post.id,
                'author': request.user.id
            }
            
            if not comment_data['content']:
                return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = CommentSerializer(data=comment_data, context={'request': request})
            if serializer.is_valid():
                comment = serializer.save(author=request.user, post=post)
                return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_comment(request, pk):
    """Like or unlike a comment"""
    comment = get_object_or_404(Comment, pk=pk)
    
    if comment.likes.filter(id=request.user.id).exists():
        comment.likes.remove(request.user)
        return Response({'liked': False})
    else:
        comment.likes.add(request.user)
        return Response({'liked': True})

# Follow views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """Follow or unfollow a user"""
    from authentication.models import User
    user_to_follow = get_object_or_404(User, id=user_id)
    
    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )
    
    if not created:
        follow.delete()
        return Response({'following': False})
    
    return Response({'following': True})

@api_view(['GET'])
def user_followers(request, user_id):
    """Get followers of a user"""
    from authentication.models import User
    user = get_object_or_404(User, id=user_id)
    followers = Follow.objects.filter(following=user).select_related('follower')
    serializer = FollowSerializer(followers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_following(request, user_id):
    """Get users that a user is following"""
    from authentication.models import User
    user = get_object_or_404(User, id=user_id)
    following = Follow.objects.filter(follower=user).select_related('following')
    serializer = FollowSerializer(following, many=True)
    return Response(serializer.data)

# Repost views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def repost(request, post_pk):
    """Repost a post"""
    post = get_object_or_404(Post, pk=post_pk)
    
    # Check if already reposted
    existing_repost = Repost.objects.filter(user=request.user, original_post=post).first()
    if existing_repost:
        existing_repost.delete()
        return Response({'reposted': False})
    
    data = request.data.copy()
    data['original_post'] = post.id
    serializer = RepostCreateSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User posts
@api_view(['GET'])
def user_posts(request, user_id):
    """Get posts by a specific user"""
    from authentication.models import User
    user = get_object_or_404(User, id=user_id)
    posts = Post.objects.filter(author=user).select_related('author').prefetch_related('likes', 'comments')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

# Category views
@api_view(['GET'])
def category_list(request):
    """Get all categories"""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def category_posts(request, category_slug):
    """Get posts by category"""
    category = get_object_or_404(Category, slug=category_slug, is_active=True)
    posts = Post.objects.filter(category=category).select_related('author').prefetch_related('likes', 'comments')
    
    # Apply pagination
    paginator = PostPagination()
    paginated_posts = paginator.paginate_queryset(posts, request)
    serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get statistics for the current user"""
    user = request.user
    
    # Count followers
    followers_count = Follow.objects.filter(following=user).count()
    
    # Count posts
    total_posts = Post.objects.filter(author=user).count()
    published_posts = Post.objects.filter(author=user, is_published=True).count()
    draft_posts = Post.objects.filter(author=user, is_published=False).count()
    
    # Count total views
    total_views = Post.objects.filter(author=user).aggregate(
        total_views=models.Sum('views')
    )['total_views'] or 0
    
    stats = {
        'followers': followers_count,
        'posts': total_posts,
        'published_posts': published_posts,
        'drafts': draft_posts,
        'views': total_views
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts_list(request):
    """Get all posts by the current user"""
    user = request.user
    posts = Post.objects.filter(author=user).select_related('author', 'category').prefetch_related('likes', 'comments').order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_library(request):
    """Get user's saved/bookmarked posts (My Library)"""
    user = request.user
    saved_posts = SavedPost.objects.filter(user=user).select_related('post__author', 'post__category').prefetch_related('post__likes', 'post__comments').order_by('-saved_at')
    posts = [saved_post.post for saved_post in saved_posts]
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_favorites(request):
    """Get user's favorite posts (liked posts)"""
    user = request.user
    favorite_posts = user.liked_posts.all().select_related('author', 'category').prefetch_related('likes', 'comments').order_by('-created_at')
    serializer = PostSerializer(favorite_posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following_list(request):
    """Get list of users that the current user is following"""
    try:
        # Get all users that the current user is following
        following = Follow.objects.filter(follower=request.user).select_related('following')
        following_users = [{
            'id': follow.following.id,
            'username': follow.following.username,
            'first_name': follow.following.first_name,
            'last_name': follow.following.last_name,
            'email': follow.following.email,
            'created_at': follow.created_at
        } for follow in following]
        
        return Response(following_users)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch following list'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_post(request):
    """Save a post to user's library"""
    try:
        user = request.user
        post_id = request.data.get('post_id')
        
        if not post_id:
            return Response(
                {'message': 'post_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the post
        try:
            post = Post.objects.get(id=post_id, is_published=True)
        except Post.DoesNotExist:
            return Response(
                {'message': 'Post not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already saved
        if SavedPost.objects.filter(user=user, post=post).exists():
            return Response(
                {'message': 'Post is already saved to your library'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save the post
        saved_post = SavedPost.objects.create(user=user, post=post)
        serializer = SavedPostSerializer(saved_post, context={'request': request})
        
        return Response({
            'message': 'Post saved to library successfully',
            'saved_post': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'message': 'Failed to save post', 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user statistics for dashboard"""
    try:
        user = request.user
        
        # Count user's posts
        posts_count = Post.objects.filter(author=user).count()
        
        # Count user's followers
        followers_count = Follow.objects.filter(following=user).count()
        
        # Count user's drafts (unpublished posts)
        drafts_count = Post.objects.filter(author=user, is_published=False).count()
        
        # Calculate total views (sum of views from all user's posts)
        total_views = Post.objects.filter(author=user).aggregate(
            total=models.Sum('views')
        )['total'] or 0
        
        stats = {
            'posts': posts_count,
            'followers': followers_count,
            'drafts': drafts_count,
            'views': total_views
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch user stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_posts(request):
    """Get all posts by the current user"""
    try:
        user = request.user
        posts = Post.objects.filter(author=user).order_by('-created_at')
        
        posts_data = []
        for post in posts:
            # Get like count
            like_count = post.likes.count()
            
            # Get comment count
            comment_count = Comment.objects.filter(post=post).count()
            
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'excerpt': post.excerpt,
                'is_published': post.is_published,
                'created_at': post.created_at,
                'updated_at': post.updated_at,
                'views': post.views,
                'like_count': like_count,
                'comment_count': comment_count,
                'category': {
                    'id': post.category.id,
                    'name': post.category.name,
                    'slug': post.category.slug
                } if post.category else None
            })
        
        return Response(posts_data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch user posts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def trending_posts(request):
    """Get trending posts (most liked posts in the last 7 days)"""
    try:
        from datetime import datetime, timedelta
        
        # Get posts from the last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        
        # Get posts ordered by like count (trending)
        trending_posts = Post.objects.filter(
            is_published=True,
            created_at__gte=week_ago
        ).annotate(
            like_count=models.Count('likes')
        ).order_by('-like_count', '-created_at')[:10]
        
        posts_data = []
        for post in trending_posts:
            # Get like count
            like_count = post.likes.count()
            
            # Get comment count
            comment_count = Comment.objects.filter(post=post).count()
            
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'excerpt': post.excerpt,
                'created_at': post.created_at,
                'views': post.views,
                'like_count': like_count,
                'comment_count': comment_count,
                'author': {
                    'id': post.author.id,
                    'username': post.author.username,
                    'first_name': post.author.first_name,
                    'last_name': post.author.last_name
                },
                'category': {
                    'id': post.category.id,
                    'name': post.category.name,
                    'slug': post.category.slug
                } if post.category else None
            })
        
        return Response(posts_data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch trending posts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def search_posts(request):
    """Search posts by title, content, or author"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response([], status=status.HTTP_200_OK)
    
    try:
        # Search in title, content, excerpt, and author username
        posts = Post.objects.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(excerpt__icontains=query) |
            Q(author__username__icontains=query),
            is_published=True
        ).select_related('author', 'category').prefetch_related('likes', 'comments').order_by('-created_at')
        
        # Limit results to prevent overwhelming response
        posts = posts[:50]
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Search failed. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def following_feed(request):
    """Get posts from users that the current user follows"""
    try:
        user = request.user
        
        # Get users that the current user follows
        following_users = Follow.objects.filter(follower=user).values_list('following', flat=True)
        
        if not following_users:
            return Response([], status=status.HTTP_200_OK)
        
        # Get posts from followed users, ordered by creation date
        posts = Post.objects.filter(
            author__in=following_users,
            is_published=True
        ).select_related('author', 'category').prefetch_related('likes', 'comments').order_by('-created_at')
        
        # Limit to recent posts (last 20)
        posts = posts[:20]
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch following feed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )