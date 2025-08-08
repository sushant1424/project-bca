"""
Advanced Recommendation Engine for Wrytera
Implements collaborative filtering, content-based filtering, and hybrid recommendations
"""

from django.db.models import Count, Q, F, Avg
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import math
from collections import defaultdict
from .models import Post, Follow, PostView, Comment, Category

User = get_user_model()

class RecommendationEngine:
    """
    Advanced recommendation system that combines multiple algorithms
    """
    
    def __init__(self, user=None):
        self.user = user
        self.weights = {
            'collaborative': 0.4,
            'content_based': 0.3,
            'trending': 0.2,
            'social': 0.1
        }
    
    def get_user_recommendations(self, limit=12):
        """
        Get personalized user recommendations based on multiple factors
        """
        if not self.user:
            return self._get_popular_users(limit)
        
        # Get users the current user is already following
        following_ids = set(
            Follow.objects.filter(follower=self.user)
            .values_list('following_id', flat=True)
        )
        following_ids.add(self.user.id)  # Exclude self
        
        # Combine different recommendation strategies
        collaborative_users = self._collaborative_user_filtering()
        content_based_users = self._content_based_user_filtering()
        social_users = self._social_network_users()
        
        # Score and rank users
        user_scores = defaultdict(float)
        
        # Add collaborative filtering scores
        for user_id, score in collaborative_users.items():
            if user_id not in following_ids:
                user_scores[user_id] += score * self.weights['collaborative']
        
        # Add content-based scores
        for user_id, score in content_based_users.items():
            if user_id not in following_ids:
                user_scores[user_id] += score * self.weights['content_based']
        
        # Add social network scores
        for user_id, score in social_users.items():
            if user_id not in following_ids:
                user_scores[user_id] += score * self.weights['social']
        
        # Sort by score and get top recommendations
        sorted_users = sorted(user_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_user_ids = [user_id for user_id, score in sorted_users[:limit]]
        
        # Get user objects with additional stats
        return User.objects.filter(id__in=recommended_user_ids).annotate(
            posts_count=Count('posts'),
            followers_count=Count('followers'),
            avg_post_likes=Avg('posts__likes')
        )
    
    def get_post_recommendations(self, limit=12):
        """
        Get personalized post recommendations
        """
        if not self.user:
            return self._get_trending_posts(limit)
        
        # Get posts from users we're following
        following_ids = Follow.objects.filter(follower=self.user).values_list('following_id', flat=True)
        
        # Get posts user has already interacted with
        interacted_post_ids = set()
        interacted_post_ids.update(
            PostView.objects.filter(user=self.user).values_list('post_id', flat=True)
        )
        interacted_post_ids.update(
            self.user.liked_posts.values_list('id', flat=True)
        )
        interacted_post_ids.update(
            Comment.objects.filter(author=self.user).values_list('post_id', flat=True)
        )
        
        # Combine different recommendation strategies
        collaborative_posts = self._collaborative_post_filtering()
        content_based_posts = self._content_based_post_filtering()
        trending_posts = self._get_trending_posts_dict()
        
        # Score and rank posts
        post_scores = defaultdict(float)
        
        # Add collaborative filtering scores
        for post_id, score in collaborative_posts.items():
            if post_id not in interacted_post_ids:
                post_scores[post_id] += score * self.weights['collaborative']
        
        # Add content-based scores
        for post_id, score in content_based_posts.items():
            if post_id not in interacted_post_ids:
                post_scores[post_id] += score * self.weights['content_based']
        
        # Add trending scores
        for post_id, score in trending_posts.items():
            if post_id not in interacted_post_ids:
                post_scores[post_id] += score * self.weights['trending']
        
        # Sort by score and get top recommendations
        sorted_posts = sorted(post_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_post_ids = [post_id for post_id, score in sorted_posts[:limit]]
        
        return Post.objects.filter(id__in=recommended_post_ids).select_related('author', 'category')
    
    def _collaborative_user_filtering(self):
        """
        Find users similar to current user based on shared interests
        """
        user_scores = defaultdict(float)
        
        # Get users who liked the same posts as current user
        liked_posts = self.user.liked_posts.all()
        
        for post in liked_posts:
            # Find other users who liked this post
            other_likers = post.likes.exclude(id=self.user.id)
            for other_user in other_likers:
                user_scores[other_user.id] += 1.0
        
        # Get users who commented on the same posts
        commented_posts = Post.objects.filter(comments__author=self.user).distinct()
        
        for post in commented_posts:
            other_commenters = User.objects.filter(
                comments__post=post
            ).exclude(id=self.user.id).distinct()
            
            for other_user in other_commenters:
                user_scores[other_user.id] += 0.5
        
        # Normalize scores
        max_score = max(user_scores.values()) if user_scores else 1
        return {user_id: score / max_score for user_id, score in user_scores.items()}
    
    def _content_based_user_filtering(self):
        """
        Recommend users based on content preferences
        """
        user_scores = defaultdict(float)
        
        # Get user's preferred categories based on interactions
        user_categories = self._get_user_category_preferences()
        
        if not user_categories:
            return user_scores
        
        # Find users who post in similar categories
        for category_id, preference_score in user_categories.items():
            category_authors = User.objects.filter(
                posts__category_id=category_id
            ).annotate(
                posts_in_category=Count('posts', filter=Q(posts__category_id=category_id))
            ).exclude(id=self.user.id)
            
            for author in category_authors:
                user_scores[author.id] += preference_score * (author.posts_in_category / 10.0)
        
        # Normalize scores
        max_score = max(user_scores.values()) if user_scores else 1
        return {user_id: score / max_score for user_id, score in user_scores.items()}
    
    def _social_network_users(self):
        """
        Recommend users based on social connections (friends of friends)
        """
        user_scores = defaultdict(float)
        
        # Get users followed by people we follow
        following_ids = Follow.objects.filter(follower=self.user).values_list('following_id', flat=True)
        
        second_degree_follows = Follow.objects.filter(
            follower_id__in=following_ids
        ).exclude(following=self.user).values('following_id').annotate(
            mutual_count=Count('following_id')
        )
        
        for follow_data in second_degree_follows:
            user_scores[follow_data['following_id']] = follow_data['mutual_count'] / len(following_ids)
        
        return user_scores
    
    def _collaborative_post_filtering(self):
        """
        Recommend posts based on similar users' preferences
        """
        post_scores = defaultdict(float)
        
        # Find similar users
        similar_users = self._collaborative_user_filtering()
        
        # Get posts liked by similar users
        for user_id, similarity_score in similar_users.items():
            try:
                similar_user = User.objects.get(id=user_id)
                liked_posts = similar_user.liked_posts.all()
                
                for post in liked_posts:
                    post_scores[post.id] += similarity_score
            except User.DoesNotExist:
                continue
        
        return post_scores
    
    def _content_based_post_filtering(self):
        """
        Recommend posts based on user's content preferences
        """
        post_scores = defaultdict(float)
        
        # Get user's category preferences
        user_categories = self._get_user_category_preferences()
        
        if not user_categories:
            return post_scores
        
        # Score posts based on category preferences
        for category_id, preference_score in user_categories.items():
            recent_posts = Post.objects.filter(
                category_id=category_id,
                created_at__gte=timezone.now() - timedelta(days=30)
            ).exclude(author=self.user)
            
            for post in recent_posts:
                # Factor in post engagement
                engagement_score = (
                    post.like_count() * 2 +
                    post.comment_count() * 3 +
                    post.view_count() * 0.1
                ) / 10.0
                
                post_scores[post.id] += preference_score * engagement_score
        
        return post_scores
    
    def _get_user_category_preferences(self):
        """
        Analyze user's category preferences based on interactions
        """
        category_scores = defaultdict(float)
        
        # Analyze liked posts
        liked_posts = self.user.liked_posts.filter(category__isnull=False)
        for post in liked_posts:
            category_scores[post.category.id] += 2.0
        
        # Analyze commented posts
        commented_posts = Post.objects.filter(
            comments__author=self.user,
            category__isnull=False
        ).distinct()
        for post in commented_posts:
            category_scores[post.category.id] += 1.5
        
        # Analyze viewed posts
        viewed_posts = Post.objects.filter(
            post_views__user=self.user,
            category__isnull=False
        ).distinct()
        for post in viewed_posts:
            category_scores[post.category.id] += 0.5
        
        # Normalize scores
        total_score = sum(category_scores.values())
        if total_score > 0:
            return {cat_id: score / total_score for cat_id, score in category_scores.items()}
        
        return {}
    
    def _get_trending_posts_dict(self):
        """
        Get trending posts as a dictionary with scores
        """
        posts = Post.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        )
        
        post_scores = {}
        for post in posts:
            post_scores[post.id] = post.trending_score()
        
        return post_scores
    
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
        Get trending topics/categories based on recent activity
        """
        # Get categories with recent activity
        recent_cutoff = timezone.now() - timedelta(days=7)
        
        trending_categories = Category.objects.annotate(
            recent_posts=Count('posts', filter=Q(posts__created_at__gte=recent_cutoff)),
            recent_likes=Count('posts__likes', filter=Q(posts__created_at__gte=recent_cutoff)),
            recent_comments=Count('posts__comments', filter=Q(posts__created_at__gte=recent_cutoff)),
            recent_views=Count('posts__post_views', filter=Q(posts__created_at__gte=recent_cutoff))
        ).filter(
            recent_posts__gt=0
        )
        
        # Calculate trending scores
        categories_with_scores = []
        for category in trending_categories:
            # Weighted score based on different engagement types
            score = (
                category.recent_posts * 5 +
                category.recent_likes * 3 +
                category.recent_comments * 4 +
                category.recent_views * 0.1
            )
            categories_with_scores.append((category, score))
        
        # Sort by score
        categories_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return with engagement counts
        trending_topics = []
        for category, score in categories_with_scores[:limit]:
            trending_topics.append({
                'name': category.name,
                'slug': category.slug,
                'count': category.recent_posts + category.recent_likes + category.recent_comments,
                'score': score
            })
        
        return trending_topics

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
