

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_profile_two_factor_enabled'),
    ]

    operations = [
        migrations.AddField(
            model_name='diagram',
            name='riskTable',
            field=models.TextField(default=''),
        ),
    ]
