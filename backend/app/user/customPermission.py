from rest_framework import generics, authentication, permissions
from django.contrib.auth import get_user_model, login

class HasConfirmedEmail(permissions.BasePermission):
    """ Permission for the user if he has validated his email"""
    message = 'Account is not active'
    
    def has_permission(self, request, view):
        """Check if the user has confirmed his email after account creation"""
 
        if not 'email' in request.data:
            return False
       
        email = request.data['email']
        user = get_user_model().objects.filter(email=email).first()
        if not user is None:
            return user.profile.email_confirmed
        return False

    def __str__(self):
    	return "Has confirmed email permission class"
