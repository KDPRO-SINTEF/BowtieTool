# Generated by Django 2.2.19 on 2021-03-25 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_diagram_risktable'),
    ]

    operations = [
        migrations.AddField(
            model_name='diagram',
            name='preview',
            field=models.TextField(default=''),
        ),
    ]