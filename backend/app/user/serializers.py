from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from core.models import Profile

class UserSerializer(serializers.ModelSerializer):
    """Serializer for users"""

    class Meta:
        model = get_user_model()
        fields = ('email', 'password', 'username')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def create(self, validated_data):
        """Create new user and return it"""
        user = get_user_model().objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Update a user, setting its new password correctly """

        password = validated_data.pop('password', None)  # None is the default arg
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class AuthTokenSerialize(serializers.Serializer):
    """Serializer for user authentication object"""

    email = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        """Validate and authenticate the user"""
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(request=self.context.get('request'),
                            username=email,
                            password=password
        )

        if not user:
            msg = _('Authentication failed')
            raise serializers.ValidationError(msg, code='authentication')
        
        elif  user.profile.password_reset or not user.profile.email_confirmed:
            msg = _('Authentication failed')
            raise serializers.ValidationError(msg, code='authentication')
                
        attrs['user'] = user
        return attrs

