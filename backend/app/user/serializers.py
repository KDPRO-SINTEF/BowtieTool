from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers
from core.models import Profile
from django.forms import ValidationError
import django.contrib.auth.password_validation as validators
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""

    class Meta:
        """Meta information"""
        model = get_user_model()
        fields = ('email', 'password', 'username')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 9}}

    def create(self, validated_data):
        """Create new user and return it"""

        print(validated_data)
        user = get_user_model().objects.create_user(**validated_data)

        if user is None:
            serializers.ValidationError("Validation error", code='authentication')

        return user

    def update(self, instance, validated_data):
        """Update a user, setting its new password correctly """

        password = validated_data.pop('password', None)  # None is the default arg
        user = super().update(instance, validated_data)

        if password:
            try:
                validators.validate_password(password)
                user.set_password(password)
                user.save()
            except ValidationError as err_valid:
                serializers.ValidationError(err_valid, code='authentication')
        return user


class AuthTokenSerialize(serializers.Serializer):
    """Serializer for user authentication object"""

    email = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def __str__(self):
        return "required fields: email and password"

    def validate(self, attrs):
        """Validate and authenticate the user"""
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(request=self.context.get('request'),
                            username=email,
                            password=password
        )

        if user :
            attrs['user'] = user
            Profile.objects.filter(user=user).update(last_login=timezone.now())
            return attrs

        msg = _('Authentication failed')
        raise serializers.ValidationError(msg, code='authentication')
