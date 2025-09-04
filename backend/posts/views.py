from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import models
from .models import Post, Comment, Follow, Repost, Category, SavedPost, PostView, Notification
from .serializers import (
    PostSerializer, PostCreateSerializer, 
    FollowSerializer, RepostSerializer, RepostCreateSerializer,
    CategorySerializer, SavedPostSerializer, NotificationSerializer
)
from .comment_serializers import CommentSerializer, AdminCommentSerializer

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
        
        # Handle search parameter - only search by post title and username
        search = request.GET.get('search', '')
        if search:
            posts = posts.filter(
                Q(title__icontains=search) | 
                Q(author__username__icontains=search)
            )
        
        # Apply pagination
        paginator = PostPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Debug logging
            print(f"=== POST CREATION DEBUG ===")
            print(f"User: {request.user}")
            print(f"Request data: {request.data}")
            print(f"Request content type: {request.content_type}")
            
            # Clean the data before serialization
            data = dict(request.data)
            
            # Handle category field specifically
            if 'category' in data:
                category_value = data['category']
                print(f"Category value: '{category_value}' (type: {type(category_value)})")
                
                if category_value and isinstance(category_value, str) and category_value.strip():
                    # Try to find existing category or create new one
                    from django.utils.text import slugify
                    category_name = category_value.strip()
                    try:
                        category_obj = Category.objects.get(name__iexact=category_name)
                        print(f"Found existing category: {category_obj}")
                    except Category.DoesNotExist:
                        # Create new category
                        slug = slugify(category_name)
                        if not slug:
                            slug = 'general'
                        
                        # Ensure unique slug
                        counter = 1
                        original_slug = slug
                        while Category.objects.filter(slug=slug).exists():
                            slug = f"{original_slug}-{counter}"
                            counter += 1
                        
                        category_obj = Category.objects.create(
                            name=category_name,
                            slug=slug
                        )
                        print(f"Created new category: {category_obj}")
                    
                    # Replace string with category object ID
                    data['category'] = category_obj.id
                else:
                    # Remove empty category
                    data.pop('category', None)
                    print("Removed empty category")
            
            print(f"Cleaned data: {data}")
            
            # Ensure author is set in data before serialization
            print(f"Setting author in data: {request.user} (ID: {request.user.id})")
            data['author'] = request.user.id
            
            # Create serializer with cleaned data
            serializer = PostCreateSerializer(data=data, context={'request': request})
            print(f"Serializer created with author: {data.get('author')}")
            
            if serializer.is_valid():
                print("Serializer is valid, saving...")
                # Double-check author is set before saving
                validated_data = serializer.validated_data
                if 'author' not in validated_data or not validated_data['author']:
                    print("WARNING: Author not in validated_data, setting manually")
                    validated_data['author'] = request.user
                
                post = serializer.save()
                print(f"Post saved successfully: {post.id} by {post.author}")
                
                # Return the created post with full serialization
                response_serializer = PostSerializer(post, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors,
                    'received_data': data
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            import traceback
            print(f"Exception in post creation: {str(e)}")
            print(f"Exception type: {type(e)}")
            traceback.print_exc()
            
            return Response({
                'error': f'Server error during post creation: {str(e)}',
                'type': str(type(e)),
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
def post_detail(request, pk):
    """Get, update, or delete a specific post"""
    post = get_object_or_404(Post, pk=pk)
    
    if request.method == 'GET':
        # Only increment view count if this is a full post view (not API call for other purposes)
        # Views should only be counted when users actually view the post content
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
        
        try:
            post_id = post.pk
            post_title = post.title
            print(f"Attempting to delete post {post_id}: {post_title}")
            
            # Simple delete - let Django handle CASCADE
            post.delete()
            print(f"Successfully deleted post {post_id}: {post_title}")
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            print(f"Error deleting post {pk}: {str(e)}")
            print(f"Exception type: {type(e).__name__}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            
            return Response(
                {'error': 'Failed to delete post', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
def track_post_view(request, pk):
    """Track a post view - only counts when user actually views the full post"""
    from datetime import datetime, timedelta
    from django.utils import timezone
    
    post = get_object_or_404(Post, pk=pk)
    
    try:
        # Get client IP address
        def get_client_ip(request):
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            return ip
        
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        user = request.user if request.user.is_authenticated else None
        
        # Check if this view should be counted (prevent spam)
        # Don't count multiple views from same user/IP within 30 minutes
        time_threshold = timezone.now() - timedelta(minutes=30)
        
        existing_view = None
        if user:
            existing_view = PostView.objects.filter(
                post=post,
                user=user,
                viewed_at__gte=time_threshold
            ).first()
        else:
            existing_view = PostView.objects.filter(
                post=post,
                ip_address=ip_address,
                user__isnull=True,
                viewed_at__gte=time_threshold
            ).first()
        
        if not existing_view:
            # Create new view record
            PostView.objects.create(
                post=post,
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Update the post's view count cache
            post.views = post.view_count()
            post.save(update_fields=['views'])
            
            return Response({
                'message': 'View tracked successfully',
                'view_count': post.view_count()
            })
        else:
            return Response({
                'message': 'View already counted recently',
                'view_count': post.view_count()
            })
    
    except Exception as e:
        # If PostView model doesn't exist yet (before migration), fall back to simple increment
        post.views += 1
        post.save(update_fields=['views'])
        
        return Response({
            'message': 'View tracked (fallback mode)',
            'view_count': post.views
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, pk):
    """Like or unlike a post"""
    post = get_object_or_404(Post, pk=pk)
    
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        like_count = post.likes.count()
        return Response({
            'liked': False,
            'like_count': like_count
        })
    else:
        post.likes.add(request.user)
        like_count = post.likes.count()
        return Response({
            'liked': True,
            'like_count': like_count
        })

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
@api_view(['GET', 'POST'])
def category_list(request):
    """Get all categories or create a new category"""
    if request.method == 'GET':
        # GET categories is public - no authentication required
        categories = Category.objects.filter(is_active=True).annotate(
            posts_count=models.Count('posts')
        ).order_by('name')
        
        # Handle search parameter
        search = request.GET.get('search', '')
        if search:
            categories = categories.filter(name__icontains=search)
        
        # Apply pagination
        paginator = PostPagination()
        paginated_categories = paginator.paginate_queryset(categories, request)
        
        # Add posts_count to serialized data
        categories_data = []
        for category in paginated_categories:
            data = CategorySerializer(category).data
            data['posts_count'] = category.posts_count
            categories_data.append(data)
        
        return paginator.get_paginated_response(categories_data)
    
    elif request.method == 'POST':
        # POST requires authentication
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Temporarily removed staff check for demo access
        # if not request.user.is_staff:
        #     return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    
    # Count followers (users following this user)
    followers_count = Follow.objects.filter(following=user).count()
    
    # Count following (users this user is following)
    following_count = Follow.objects.filter(follower=user).count()
    
    # Count posts
    total_posts = Post.objects.filter(author=user).count()
    published_posts = Post.objects.filter(author=user, is_published=True).count()
    draft_posts = Post.objects.filter(author=user, is_published=False).count()
    
    # Count total views from all user's posts
    total_views = Post.objects.filter(author=user).aggregate(
        total_views=models.Sum('views')
    )['total_views'] or 0
    
    # Count total likes received on all user's posts
    total_likes = Post.objects.filter(author=user).aggregate(
        total_likes=models.Count('likes')
    )['total_likes'] or 0
    
    # Count saved posts by this user
    saved_posts_count = SavedPost.objects.filter(user=user).count()
    
    stats = {
        'followers': followers_count,
        'following': following_count,
        'posts': total_posts,
        'published_posts': published_posts,
        'drafts': draft_posts,
        'views': total_views,
        'likes': total_likes,
        'saved_posts': saved_posts_count
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
def save_post(request, post_id=None):
    """Save a post to user's library"""
    try:
        user = request.user
        
        # Get post_id from URL parameter or request data
        if post_id is None:
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
        saved_post_obj = SavedPost.objects.filter(user=user, post=post).first()
        
        if saved_post_obj:
            # Unsave the post
            saved_post_obj.delete()
            return Response({
                'message': 'Post removed from library successfully',
                'saved': False
            }, status=status.HTTP_200_OK)
        else:
            # Save the post
            saved_post = SavedPost.objects.create(user=user, post=post)
            serializer = SavedPostSerializer(saved_post, context={'request': request})
            
            return Response({
                'message': 'Post saved to library successfully',
                'saved': True,
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
def admin_dashboard_stats(request):
    """Get admin dashboard statistics with accurate counts and trends"""
    try:
        from authentication.models import User
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Get current date and last month date for trend calculations
        now = timezone.now()
        last_month = now - timedelta(days=30)
        
        # Total Users
        total_users = User.objects.count()
        users_last_month = User.objects.filter(date_joined__gte=last_month).count()
        users_trend = round((users_last_month / max(total_users - users_last_month, 1)) * 100, 1) if total_users > users_last_month else 0
        
        # Total Posts
        total_posts = Post.objects.count()
        posts_last_month = Post.objects.filter(created_at__gte=last_month).count()
        posts_trend = round((posts_last_month / max(total_posts - posts_last_month, 1)) * 100, 1) if total_posts > posts_last_month else 0
        
        # Total Categories
        total_categories = Category.objects.filter(is_active=True).count()
        categories_last_month = Category.objects.filter(created_at__gte=last_month).count()
        categories_trend = round((categories_last_month / max(total_categories - categories_last_month, 1)) * 100, 1) if total_categories > categories_last_month else 0
        
        # Total Comments
        total_comments = Comment.objects.count()
        comments_last_month = Comment.objects.filter(created_at__gte=last_month).count()
        comments_trend = round((comments_last_month / max(total_comments - comments_last_month, 1)) * 100, 1) if total_comments > comments_last_month else 0
        
        # Recent Users (latest 5)
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_users_data = [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined
        } for user in recent_users]
        
        stats = {
            'total_users': total_users,
            'users_trend': users_trend,
            'total_posts': total_posts,
            'posts_trend': posts_trend,
            'total_categories': total_categories,
            'categories_trend': categories_trend,
            'total_comments': total_comments,
            'comments_trend': comments_trend,
            'recent_users': recent_users_data
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch admin dashboard stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user_posts(request):
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
    """Get trending posts using Exponential Decay Algorithm"""
    try:
        from datetime import datetime, timedelta
        
        # Get all published posts from the last 30 days (wider range for algorithm)
        month_ago = datetime.now() - timedelta(days=30)
        
        # Get posts with related data for efficiency
        posts = Post.objects.filter(
            is_published=True,
            created_at__gte=month_ago
        ).select_related('author', 'category').prefetch_related('likes', 'comments')
        
        # Calculate trending scores for all posts
        posts_with_scores = []
        for post in posts:
            # Calculate trending score using our algorithm
            score = post.trending_score(decay_hours=24, lambda_decay=0.1)
            
            # Only include posts with engagement (score > 0)
            if score > 0:
                posts_with_scores.append({
                    'post': post,
                    'trending_score': score
                })
        
        # Sort by trending score (highest first)
        posts_with_scores.sort(key=lambda x: x['trending_score'], reverse=True)
        
        # Get top 10 trending posts
        top_trending = posts_with_scores[:10]
        
        # Format response data
        posts_data = []
        for item in top_trending:
            post = item['post']
            
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'excerpt': post.excerpt,
                'created_at': post.created_at,
                'views': post.view_count(),
                'like_count': post.like_count(),
                'comment_count': post.comment_count(),
                'trending_score': item['trending_score'],  # Include the algorithm score
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
        
        return Response({
            'results': posts_data,
            'algorithm_info': {
                'name': 'Time Delay Weighted Engagement Algorithm',
                'description': 'Uses exponential decay to prioritize recent engagement',
                'formula': '(comments×5 + likes×3 + views×1) × e^(-λ×hours_since_decay)',
                'decay_hours': 24,
                'lambda_decay': 0.1
            }
        })
        
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


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def all_comments_list(request):
    """Get all comments for admin dashboard"""
    try:
        # Get all comments with related data including post author
        comments = Comment.objects.select_related(
            'author', 'post', 'post__author'
        ).order_by('-created_at')
        
        # Handle search parameter
        search = request.GET.get('search', '')
        if search:
            comments = comments.filter(
                Q(content__icontains=search) |
                Q(author__username__icontains=search) |
                Q(post__title__icontains=search)
            )
        
        # Apply pagination
        paginator = PostPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)
        serializer = AdminCommentSerializer(paginated_comments, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch comments'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def comment_detail(request, pk):
    """Get, update, or delete a specific comment"""
    comment = get_object_or_404(Comment, pk=pk)
    
    if request.method == 'GET':
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if comment.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CommentSerializer(comment, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if comment.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    """Get, update, or delete a specific category"""
    category = get_object_or_404(Category, pk=pk)
    
    if request.method == 'GET':
        # Add posts count to the response
        data = CategorySerializer(category).data
        data['posts_count'] = category.posts.count()
        return Response(data)
    
    elif request.method == 'PUT':
        # Temporarily removed staff check for demo access
        # if not request.user.is_staff:
        #     return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Temporarily removed staff check for demo access
        # if not request.user.is_staff:
        #     return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if category has posts
        posts_count = category.posts.count()
        if posts_count > 0:
            return Response(
                {'error': f'Cannot delete category with {posts_count} posts. Move posts to another category first.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Notification views
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """Get user's notifications"""
    notifications = Notification.objects.filter(recipient=request.user).select_related('sender')
    
    # Filter by read status if specified
    is_read = request.GET.get('is_read')
    if is_read is not None:
        is_read_bool = is_read.lower() == 'true'
        notifications = notifications.filter(is_read=is_read_bool)
    
    # Apply pagination
    paginator = PostPagination()
    paginated_notifications = paginator.paginate_queryset(notifications, request)
    serializer = NotificationSerializer(paginated_notifications, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    """Mark a notification as read"""
    notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
    notification.mark_as_read()
    return Response({'message': 'Notification marked as read'})


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all user's notifications as read"""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def notifications_count(request):
    """Get count of unread notifications"""
    unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': unread_count})


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """Delete a notification"""
    notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
    notification.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
def recommended_posts(request):
    """Get algorithmic post recommendations"""
    from .recommendation_engine import RecommendationEngine
    
    user = request.user if request.user.is_authenticated else None
    engine = RecommendationEngine(user)
    
    limit = int(request.GET.get('limit', 12))
    recommended_posts = engine.get_post_recommendations(limit)
    
    serializer = PostSerializer(recommended_posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def recommended_users(request):
    """Get algorithmic user recommendations"""
    from .recommendation_engine import RecommendationEngine
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    user = request.user if request.user.is_authenticated else None
    engine = RecommendationEngine(user)
    
    limit = int(request.GET.get('limit', 12))
    recommended_users = engine.get_user_recommendations(limit)
    
    # Serialize user data with additional stats
    users_data = []
    for recommended_user in recommended_users:
        user_data = {
            'id': recommended_user.id,
            'username': recommended_user.username,
            'first_name': recommended_user.first_name,
            'last_name': recommended_user.last_name,
            'email': recommended_user.email,
            'posts_count': getattr(recommended_user, 'posts_count', 0),
            'followers_count': getattr(recommended_user, 'followers_count', 0),
            'avg_post_likes': getattr(recommended_user, 'avg_post_likes', 0) or 0,
        }
        users_data.append(user_data)
    
    return Response(users_data)


@api_view(['GET'])
def trending_topics(request):
    """Get trending topics/categories based on recent activity"""
    from .recommendation_engine import RecommendationEngine
    
    user = request.user if request.user.is_authenticated else None
    engine = RecommendationEngine(user)
    
    limit = int(request.GET.get('limit', 10))
    topics = engine.get_trending_topics(limit)
    
    return Response(topics)


@api_view(['GET'])
def all_users(request):
    """Get all users for recommendations (fallback)"""
    from django.contrib.auth import get_user_model
    from django.db.models import Count
    
    User = get_user_model()
    
    users = User.objects.annotate(
        posts_count=Count('posts'),
        followers_count=Count('followers')
    ).filter(
        posts_count__gt=0  # Only users with posts
    ).order_by('-followers_count', '-posts_count')
    
    # Apply pagination
    paginator = PostPagination()
    paginated_users = paginator.paginate_queryset(users, request)
    
    users_data = []
    for user in paginated_users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'posts_count': user.posts_count,
            'followers_count': user.followers_count,
        }
        users_data.append(user_data)
    
    return paginator.get_paginated_response(users_data)


@api_view(['GET'])
def user_profile_by_username(request, username):
    """Get user profile by username for profile pages"""
    from django.contrib.auth import get_user_model
    from django.db.models import Count
    
    User = get_user_model()
    
    try:
        user = User.objects.annotate(
            posts_count=Count('posts', filter=models.Q(posts__is_published=True)),
            followers_count=Count('followers'),
            following_count=Count('following')
        ).get(username=username)
        
        # Check if current user is following this user
        is_following = False
        if request.user.is_authenticated:
            is_following = Follow.objects.filter(
                follower=request.user, 
                following=user
            ).exists()
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'bio': getattr(user, 'bio', ''),
            'avatar': getattr(user, 'avatar', ''),
            'profile_image_url': user.profile_image_url,
            'website': getattr(user, 'website', ''),
            'twitter': getattr(user, 'twitter', ''),
            'linkedin': getattr(user, 'linkedin', ''),
            'posts_count': user.posts_count,
            'followers_count': user.followers_count,
            'following_count': user.following_count,
            'is_following': is_following,
            'date_joined': user.date_joined,
            'created_at': getattr(user, 'created_at', user.date_joined),
        }
        
        return Response(user_data)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Comment Views
@api_view(['GET', 'POST'])
def comment_list(request, post_pk):
    """Get comments for a post or create a new comment"""
    post = get_object_or_404(Post, pk=post_pk)
    
    if request.method == 'GET':
        comments = Comment.objects.filter(post=post, parent=None).select_related('author').prefetch_related('replies__author')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            comment = serializer.save(author=request.user, post=post)
            return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_comments_list(request):
    """Get all comments (admin view)"""
    if not request.user.is_staff and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    comments = Comment.objects.all().select_related('author', 'post').order_by('-created_at')
    serializer = AdminCommentSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
def comment_detail(request, pk):
    """Get, update, or delete a specific comment"""
    comment = get_object_or_404(Comment, pk=pk)
    
    if request.method == 'GET':
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if not request.user.is_authenticated or request.user != comment.author:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CommentSerializer(comment, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Allow comment author or admin to delete
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user != comment.author and not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_comment(request, pk):
    """Like or unlike a comment"""
    comment = get_object_or_404(Comment, pk=pk)
    
    if comment.likes.filter(id=request.user.id).exists():
        comment.likes.remove(request.user)
        return Response({'liked': False, 'like_count': comment.like_count()})
    else:
        comment.likes.add(request.user)
        return Response({'liked': True, 'like_count': comment.like_count()})