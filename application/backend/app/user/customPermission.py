from rest_framework import generics, authentication, permissions
from rest_framework.exceptions import APIException
from django.contrib.auth import get_user_model, login
from rest_framework import status

class HasConfirmedEmail(permissions.BasePermission):
    """ Permission for the user if he has validated his email"""

    def __init(self):
        super().__init()
        self.message = "kur"

    def has_permission(self, request, view):
        """Check if the user has confirmed his email after account creation"""

        if not 'email' in request.data:
            return False
        email = request.data['email']
        user = get_user_model().objects.filter(email=email).first()
        if not user is None:
            return user.profile.email_confirmed

        raise HasConfirmedEmailException() # this is a workaround, RESTFUL method doesn't work


class HasConfirmedEmailException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = dict(errors=["Incorrect credentials."])
    default_code = 'not_authenticated'