# Generated manually for collaborative filtering models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0002_remove_content_type_name'),
        ('posts', '0007_notification'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInteraction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('interaction_type', models.CharField(choices=[('view', 'View'), ('like', 'Like'), ('save', 'Save'), ('share', 'Share'), ('comment', 'Comment'), ('follow', 'Follow')], max_length=20)),
                ('weight', models.FloatField(default=1.0)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='interactions', to='posts.post')),
                ('target_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_interactions', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='UserSimilarity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('similarity_score', models.FloatField()),
                ('interaction_overlap', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='similarities_as_user1', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='similarities_as_user2', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-similarity_score'],
            },
        ),
        migrations.CreateModel(
            name='PostRecommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recommendation_type', models.CharField(choices=[('collaborative', 'Collaborative'), ('content_based', 'Content Based'), ('hybrid', 'Hybrid')], max_length=20)),
                ('score', models.FloatField()),
                ('reason', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recommendations', to='posts.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='post_recommendations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-score', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserRecommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('similarity_score', models.FloatField()),
                ('mutual_connections', models.IntegerField(default=0)),
                ('reason', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recommended_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_recommendations', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_recommendations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-similarity_score', '-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='userinteraction',
            index=models.Index(fields=['user', 'post'], name='posts_useri_user_id_post_id_idx'),
        ),
        migrations.AddIndex(
            model_name='userinteraction',
            index=models.Index(fields=['interaction_type', 'timestamp'], name='posts_useri_interac_timest_idx'),
        ),
        migrations.AddIndex(
            model_name='usersimilarity',
            index=models.Index(fields=['user1', 'similarity_score'], name='posts_users_user1_i_similar_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='usersimilarity',
            unique_together={('user1', 'user2')},
        ),
        migrations.AlterUniqueTogether(
            name='postrecommendation',
            unique_together={('user', 'post')},
        ),
        migrations.AlterUniqueTogether(
            name='userrecommendation',
            unique_together={('user', 'recommended_user')},
        ),
    ]
