from rest_framework import generics, authentication, permissions

class HasConfirmedEmail(permissions.BasePermission):
    """ Permission for the user if he has validated his email"""

    def has_permission(self, request, view):
        return request.user.password_reset

class HasNotResetPassword(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.profile.email_confirmed