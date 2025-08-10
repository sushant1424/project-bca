from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # Post URLs
    path('', views.post_list, name='post_list'),
    path('search/', views.search_posts, name='search_posts'),
    path('<int:pk>/', views.post_detail, name='post_detail'),
    path('<int:pk>/view/', views.track_post_view, name='track_post_view'),
    path('<int:pk>/like/', views.like_post, name='like_post'),
    
    # Comment URLs
    path('comments/', views.all_comments_list, name='all_comments_list'),
    path('<int:post_pk>/comments/', views.comment_list, name='comment_list'),
    path('comments/<int:pk>/', views.comment_detail, name='comment_detail'),
    path('comments/<int:pk>/like/', views.like_comment, name='like_comment'),
    
    # User posts endpoint (for frontend compatibility) - must come before users/ patterns
    path('user/<int:user_id>/', views.user_posts, name='user_posts_by_id'),
    
    # Follow URLs
    path('users/<int:user_id>/follow/', views.follow_user, name='follow_user'),
    path('users/<int:user_id>/followers/', views.user_followers, name='user_followers'),
    path('users/<int:user_id>/following/', views.user_following, name='user_following'),
    path('users/<int:user_id>/posts/', views.user_posts, name='user_posts'),
    
    # User Dashboard URLs
    path('users/stats/', views.user_stats, name='user_stats'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('users/posts/', views.current_user_posts, name='current_user_posts'),
    path('users/library/', views.user_library, name='user_library'),
    path('users/favorites/', views.user_favorites, name='user_favorites'),
    path('users/following/', views.user_following_list, name='user_following_list'),
    
    # My posts endpoint (for frontend compatibility)
    path('my-posts/', views.user_posts_list, name='my_posts'),
    
    # Following feed
    path('following-feed/', views.following_feed, name='following_feed'),
    
    # Save post to library
    path('library/save/', views.save_post, name='save_post'),
    path('<int:post_id>/save/', views.save_post, name='save_post_by_id'),
    
    # Trending posts
    path('trending/', views.trending_posts, name='trending_posts'),
    
    # Repost URLs
    path('<int:post_pk>/repost/', views.repost, name='repost'),
    
    # Category URLs
    path('categories/', views.category_list, name='category_list'),
    path('categories/<int:pk>/', views.category_detail, name='category_detail'),
    path('categories/<slug:category_slug>/', views.category_posts, name='category_posts'),
    
    # Notification URLs
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/count/', views.notifications_count, name='notifications_count'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/<int:pk>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/<int:pk>/delete/', views.delete_notification, name='delete_notification'),
    
    # Algorithmic Recommendation URLs
    path('recommendations/posts/', views.recommended_posts, name='recommended_posts'),
    path('recommendations/users/', views.recommended_users, name='recommended_users'),
    path('trending-topics/', views.trending_topics, name='trending_topics'),
    path('users/', views.all_users, name='all_users'),
    
    # User profile by username
    path('users/<str:username>/', views.user_profile_by_username, name='user_profile_by_username'),
] 