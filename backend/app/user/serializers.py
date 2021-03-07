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
        
        user = get_user_model().objects.create_user(**validated_data)

        if user is None:
            serializers.ValidationError("Validation error", code='authentication')

        return user



class UserUpdateSerialize(serializers.Serializer):
    """ Serializer for update password """


    new_password = serializers.CharField()
    old_password = serializers.CharField()

  
    def validate(self, attrs):

        new_password = attrs.get("new_password")
        old_password = attrs.get("old_password")


        validators.validate_password(new_password)
        validators.validate_password(old_password)
        if new_password == old_password:
            raise serializers.ValidationError("The two passwords must be different")
        
        return attrs

    def __str__(self):
        return "required fields old_password and new_password"


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
