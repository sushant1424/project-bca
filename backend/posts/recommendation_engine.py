

from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict
from .models import Post, Follow, PostView, Comment, Category

User = get_user_model()

class RecommendationEngine:
    
    
    def __init__(self, user=None):
        self.user = user
    
    def get_user_recommendations(self, limit=12):
       
        if not self.user:
            return self._get_popular_users(limit)
        
        # Get users already following
        following_ids = set(
            Follow.objects.filter(follower=self.user)
            .values_list('following_id', flat=True)
        )
        following_ids.add(self.user.id)  # Exclude self
        
        # Find simil
        # ar users based on shared likes
        user_scores = defaultdict(float)
        liked_posts = self.user.liked_posts.all()
        
        for post in liked_posts:
            other_likers = post.likes.exclude(id=self.user.id)
            for other_user in other_likers:
                if other_user.id not in following_ids:
                    user_scores[other_user.id] += 1.0
        
        # Sort by score
        sorted_users = sorted(user_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_user_ids = [user_id for user_id, score in sorted_users[:limit]]
        
        return User.objects.filter(id__in=recommended_user_ids).annotate(
            posts_count=Count('posts'),
            followers_count=Count('followers')
        )
    
    def get_post_recommendations(self, limit=12):
        """
        Get post recommendations using collaborative filtering
        """
        if not self.user:
            return self._get_trending_posts(limit)
        
        # Get posts already interacted with
        interacted_post_ids = set()
        interacted_post_ids.update(
            self.user.liked_posts.values_list('id', flat=True)
        )
        interacted_post_ids.update(
            Comment.objects.filter(author=self.user).values_list('post_id', flat=True)
        )
        
        # Find posts liked by similar users
        post_scores = defaultdict(float)
        liked_posts = self.user.liked_posts.all()
        
        for post in liked_posts:
            other_likers = post.likes.exclude(id=self.user.id)
            for other_user in other_likers:
                # Get other posts this similar user liked
                for other_post in other_user.liked_posts.all():
                    if other_post.id not in interacted_post_ids:
                        post_scores[other_post.id] += 1.0
        
        # Sort by score
        sorted_posts = sorted(post_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_post_ids = [post_id for post_id, score in sorted_posts[:limit]]
        
        return Post.objects.filter(id__in=recommended_post_ids).select_related('author', 'category')
    

    

    

    

    

    

    

    
    def _get_trending_posts(self, limit=12):
        """
        Get trending posts using the existing algorithm
        """
        posts = Post.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).select_related('author', 'category')
        
        # Calculate trending scores and sort
        posts_with_scores = []
        for post in posts:
            score = post.trending_score()
            posts_with_scores.append((post, score))
        
        # Sort by trending score
        posts_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [post for post, score in posts_with_scores[:limit]]
    
    def _get_popular_users(self, limit=12):
        """
        Get popular users for non-authenticated users
        """
        return User.objects.annotate(
            posts_count=Count('posts'),
            followers_count=Count('followers'),
            total_likes=Count('posts__likes')
        ).filter(
            posts_count__gt=0
        ).order_by('-followers_count', '-total_likes')[:limit]
    
    def get_trending_topics(self, limit=10):
        """
        Get trending topics based on recent engagement
        """
        # Get categories with posts from last 7 days
        recent_cutoff = timezone.now() - timedelta(days=7)
        categories = Category.objects.filter(
            posts__created_at__gte=recent_cutoff,
            posts__is_published=True
        ).distinct().annotate(
            post_count=Count('posts'),
            total_likes=Count('posts__likes'),
            total_comments=Count('posts__comments')
        ).order_by('-total_likes', '-total_comments', '-post_count')[:limit]
        
        trending_topics = []
        for category in categories:
            trending_topics.append({
                'name': category.name,
                'slug': category.slug,
                'count': category.total_likes + category.total_comments,
                'recent_posts': category.post_count
            })
        
        return trending_topics if trending_topics else [{'name': 'General', 'slug': 'general', 'count': 0}]

def get_recommendations_for_user(user, post_limit=12, user_limit=12):
    """
    Convenience function to get all recommendations for a user
    """
    engine = RecommendationEngine(user)
    
    return {
        'posts': engine.get_post_recommendations(post_limit),
        'users': engine.get_user_recommendations(user_limit),
        'trending_topics': engine.get_trending_topics()
    }
