from django.contrib import admin
from .models import Category, Post, Comment, Follow, Repost


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin interface for Category model
    """
    list_display = ('name', 'slug', 'color', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'color')
    ordering = ('name',)
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description')
        }),
        ('Appearance', {
            'fields': ('color', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin interface for Post model
    """
    list_display = ('title', 'author', 'category', 'is_published', 'views', 'like_count', 'comment_count', 'created_at')
    list_filter = ('is_published', 'category', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'author__username', 'author__email')
    list_editable = ('is_published', 'category')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('title', 'author', 'category')
        }),
        ('Content', {
            'fields': ('content', 'excerpt', 'image')
        }),
        ('Publishing', {
            'fields': ('is_published',)
        }),
        ('Statistics', {
            'fields': ('views',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'views')
    
    # Custom methods to display in list_display
    def like_count(self, obj):
        return obj.like_count()
    like_count.short_description = 'Likes'
    like_count.admin_order_field = 'likes'
    
    def comment_count(self, obj):
        return obj.comment_count()
    comment_count.short_description = 'Comments'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Admin interface for Comment model
    """
    list_display = ('get_short_content', 'author', 'post', 'parent', 'like_count', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('content', 'author__username', 'post__title')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('post', 'author', 'parent')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    
    def get_short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_short_content.short_description = 'Content'
    
    def like_count(self, obj):
        return obj.like_count()
    like_count.short_description = 'Likes'


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    """
    Admin interface for Follow model
    """
    list_display = ('follower', 'following', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower__username', 'following__username')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('follower', 'following')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)


@admin.register(Repost)
class RepostAdmin(admin.ModelAdmin):
    """
    Admin interface for Repost model
    """
    list_display = ('user', 'original_post', 'get_short_comment', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'original_post__title', 'comment')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('user', 'original_post')
        }),
        ('Content', {
            'fields': ('comment',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)
    
    def get_short_comment(self, obj):
        if obj.comment:
            return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
        return '-'
    get_short_comment.short_description = 'Comment'


# Additional admin configurations for better user experience
admin.site.site_header = "Wrytera Admin"
admin.site.site_title = "Wrytera Admin Portal"
admin.site.index_title = "Welcome to Wrytera Administration"
