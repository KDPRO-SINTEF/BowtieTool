# Generated by Django 2.2.19 on 2021-03-18 11:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_diagram_preview'),
    ]

    operations = [
        migrations.AlterField(
            model_name='diagram',
            name='preview',
            field=models.ImageField(blank=True, null=True, upload_to='./static/'),
        ),
    ]