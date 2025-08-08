from .models import Notification

def create_like_notification(post, liker):
    """Create notification when someone likes a post"""
    if post.author != liker:  # Don't notify if user likes their own post
        Notification.create_notification(
            recipient=post.author,
            sender=liker,
            notification_type='like',
            title='New Like',
            message=f'{liker.username} liked your post "{post.title}"',
            related_object=post,
            extra_data={'post_id': post.id, 'post_title': post.title}
        )

def create_comment_notification(comment):
    """Create notification when someone comments on a post"""
    if comment.post.author != comment.author:  # Don't notify if user comments on their own post
        Notification.create_notification(
            recipient=comment.post.author,
            sender=comment.author,
            notification_type='comment',
            title='New Comment',
            message=f'{comment.author.username} commented on your post "{comment.post.title}"',
            related_object=comment.post,
            extra_data={
                'post_id': comment.post.id, 
                'post_title': comment.post.title,
                'comment_content': comment.content[:100]
            }
        )

def create_follow_notification(follower, followed_user):
    """Create notification when someone follows a user"""
    Notification.create_notification(
        recipient=followed_user,
        sender=follower,
        notification_type='follow',
        title='New Follower',
        message=f'{follower.username} started following you',
        extra_data={'follower_id': follower.id, 'follower_username': follower.username}
    )

def create_post_published_notification(post):
    """Create notification when user publishes a new post (for their followers)"""
    from .models import Follow
    followers = Follow.objects.filter(followed=post.author).select_related('follower')
    
    for follow in followers:
        Notification.create_notification(
            recipient=follow.follower,
            sender=post.author,
            notification_type='post_published',
            title='New Post',
            message=f'{post.author.username} published a new post: "{post.title}"',
            related_object=post,
            extra_data={'post_id': post.id, 'post_title': post.title}
        )

def create_trending_notification(post):
    """Create notification when user's post starts trending"""
    Notification.create_notification(
        recipient=post.author,
        notification_type='trending',
        title='🔥 Your Post is Trending!',
        message=f'Your post "{post.title}" is now trending on Wrytera!',
        related_object=post,
        extra_data={'post_id': post.id, 'post_title': post.title, 'trending_rank': 1}
    )

def create_goal_completed_notification(user, goal):
    """Create notification when user completes a writing goal"""
    Notification.create_notification(
        recipient=user,
        notification_type='goal_completed',
        title='🎉 Goal Completed!',
        message=f'Congratulations! You completed your goal: "{goal.title}"',
        extra_data={
            'goal_id': goal.id, 
            'goal_title': goal.title,
            'goal_type': goal.goal_type,
            'target_value': goal.target_value
        }
    )

def create_save_notification(post, saver):
    """Create notification when someone saves a post"""
    if post.author != saver:  # Don't notify if user saves their own post
        Notification.create_notification(
            recipient=post.author,
            sender=saver,
            notification_type='save',
            title='Post Saved',
            message=f'{saver.username} saved your post "{post.title}"',
            related_object=post,
            extra_data={'post_id': post.id, 'post_title': post.title}
        )

def create_new_post_notification(post):
    """Create notification for followers when user publishes a new post"""
    from .models import Follow
    followers = Follow.objects.filter(following=post.author).select_related('follower')
    
    for follow in followers:
        Notification.create_notification(
            recipient=follow.follower,
            sender=post.author,
            notification_type='new_post',
            title='New Post',
            message=f'{post.author.username} published a new post: "{post.title}"',
            related_object=post,
            extra_data={'post_id': post.id, 'post_title': post.title}
        )

def create_system_notification(recipient, title, message, extra_data=None):
    """Create system notification"""
    Notification.create_notification(
        recipient=recipient,
        sender=None,
        notification_type='system',
        title=title,
        message=message,
        extra_data=extra_data or {}
    )
