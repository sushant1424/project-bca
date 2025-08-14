# Generated manually to add categories field to Post model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0011_post_image_credit'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='categories',
            field=models.ManyToManyField(blank=True, help_text='Multiple categories for this post', related_name='categorized_posts', to='posts.category'),
        ),
    ]
