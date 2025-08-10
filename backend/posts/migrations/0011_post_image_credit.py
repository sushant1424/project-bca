# Generated manually to add image_credit field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0010_auto_20250809_1338'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='image_credit',
            field=models.CharField(blank=True, default='', help_text='Image credit/attribution', max_length=200),
        ),
    ]
