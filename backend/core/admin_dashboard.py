from django.contrib import admin
from django.contrib.admin import AdminSite
from django.shortcuts import render
from django.db.models import Count, Sum
from django.utils.html import format_html
from authentication.models import User
from posts.models import Post, Category, Comment, Follow, Repost


class WryteraAdminSite(AdminSite):
    """
    Custom Admin Site for Wrytera with enhanced dashboard
    """
    site_header = "🚀 Wrytera Admin Dashboard"
    site_title = "Wrytera Admin"
    index_title = "Welcome to Wrytera Administration"
    
    def index(self, request, extra_context=None):
        """
        Custom admin dashboard with statistics and insights
        """
        # Get comprehensive statistics
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'staff_users': User.objects.filter(is_staff=True).count(),
            'total_posts': Post.objects.count(),
            'published_posts': Post.objects.filter(is_published=True).count(),
            'draft_posts': Post.objects.filter(is_published=False).count(),
            'total_categories': Category.objects.count(),
            'total_comments': Comment.objects.count(),
            'total_follows': Follow.objects.count(),
            'total_reposts': Repost.objects.count(),
        }
        
        # Get recent activity
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_posts = Post.objects.order_by('-created_at')[:5]
        popular_posts = Post.objects.annotate(
            like_count=Count('likes')
        ).order_by('-like_count')[:5]
        
        # Top users by post count
        top_authors = User.objects.annotate(
            post_count=Count('post')
        ).order_by('-post_count')[:5]
        
        extra_context = extra_context or {}
        extra_context.update({
            'stats': stats,
            'recent_users': recent_users,
            'recent_posts': recent_posts,
            'popular_posts': popular_posts,
            'top_authors': top_authors,
        })
        
        return super().index(request, extra_context)


# Create custom admin site instance
admin_site = WryteraAdminSite(name='wrytera_admin')


def admin_dashboard_view(request):
    """
    Enhanced admin dashboard view with comprehensive analytics
    """
    if not request.user.is_staff:
        return render(request, 'admin/access_denied.html')
    
    # Comprehensive statistics
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'staff_users': User.objects.filter(is_staff=True).count(),
        'total_posts': Post.objects.count(),
        'published_posts': Post.objects.filter(is_published=True).count(),
        'draft_posts': Post.objects.filter(is_published=False).count(),
        'total_categories': Category.objects.count(),
        'total_comments': Comment.objects.count(),
        'total_follows': Follow.objects.count(),
        'total_reposts': Repost.objects.count(),
    }
    
    # Recent activity
    recent_users = User.objects.order_by('-date_joined')[:10]
    recent_posts = Post.objects.select_related('author').order_by('-created_at')[:10]
    
    # Popular content
    popular_posts = Post.objects.annotate(
        like_count=Count('likes'),
        comment_count=Count('comments')
    ).order_by('-like_count', '-comment_count')[:10]
    
    # Top contributors
    top_authors = User.objects.annotate(
        post_count=Count('post'),
        total_likes=Sum('post__likes')
    ).order_by('-post_count', '-total_likes')[:10]
    
    # Most active categories
    popular_categories = Category.objects.annotate(
        post_count=Count('posts')
    ).order_by('-post_count')[:10]
    
    context = {
        'title': 'Wrytera Admin Dashboard',
        'stats': stats,
        'recent_users': recent_users,
        'recent_posts': recent_posts,
        'popular_posts': popular_posts,
        'top_authors': top_authors,
        'popular_categories': popular_categories,
    }
    
    return render(request, 'admin/dashboard.html', context)
