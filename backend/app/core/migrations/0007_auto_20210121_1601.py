# Generated by Django 2.2.17 on 2021-01-21 16:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_remove_diagramstat_causes'),
    ]

    operations = [
        migrations.RenameField(
            model_name='diagram',
            old_name='diagram_stat',
            new_name='diagramStat',
        ),
    ]
