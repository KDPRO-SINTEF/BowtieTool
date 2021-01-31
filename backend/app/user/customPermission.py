from rest_framework import generics, authentication, permissions
from django.contrib.auth import get_user_model, login

class HasConfirmedEmail(permissions.BasePermission):
    """ Permission for the user if he has validated his email"""
    def has_permission(self, request, view):
        """Check if the user has confirmed his email after account creation"""
        email = request.data['email']
        user = get_user_model().objects.filter(email=email).first()
        if not user is None:
            return user.profile.email_confirmed
        return False
