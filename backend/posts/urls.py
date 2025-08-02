from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # Post URLs
    path('', views.post_list, name='post_list'),
    path('search/', views.search_posts, name='search_posts'),
    path('<int:pk>/', views.post_detail, name='post_detail'),
    path('<int:pk>/like/', views.like_post, name='like_post'),
    
    # Comment URLs
    path('<int:post_pk>/comments/', views.comment_list, name='comment_list'),
    path('comments/<int:pk>/like/', views.like_comment, name='like_comment'),
    
    # Follow URLs
    path('users/<int:user_id>/follow/', views.follow_user, name='follow_user'),
    path('users/<int:user_id>/followers/', views.user_followers, name='user_followers'),
    path('users/<int:user_id>/following/', views.user_following, name='user_following'),
    path('users/<int:user_id>/posts/', views.user_posts, name='user_posts'),
    
    # User Dashboard URLs
    path('users/stats/', views.user_stats, name='user_stats'),
    path('users/posts/', views.user_posts, name='user_posts'),
    path('users/library/', views.user_library, name='user_library'),
    path('users/favorites/', views.user_favorites, name='user_favorites'),
    path('users/following/', views.user_following_list, name='user_following_list'),
    
    # Following feed
    path('following-feed/', views.following_feed, name='following_feed'),
    
    # Save post to library
    path('library/save/', views.save_post, name='save_post'),
    
    # Trending posts
    path('trending/', views.trending_posts, name='trending_posts'),
    
    # Repost URLs
    path('<int:post_pk>/repost/', views.repost, name='repost'),
    
    # Category URLs
    path('categories/', views.category_list, name='category_list'),
    path('categories/<slug:category_slug>/', views.category_posts, name='category_posts'),
] 