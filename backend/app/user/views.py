from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from user.serializers import UserSerializer, AuthTokenSerialize
from user.customPermission import HasConfirmedEmail, HasNotResetPassword
from django.core import mail 
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, login
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from django.forms import ValidationError

class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system"""
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request=request, *args, **kwargs)
        if response:
            user = get_user_model().objects.filter(email=request.data['email']).first()
            # generate an activation token for the user
            token = AccountActivationTokenGenerator().make_token(user)     
            message = "To activate your account please click on the following link %s" % (
                reverse('user:confirm') + urlsafe_base64_encode(user.pk) + '/' + token)
            subject = 'Activate account for Bowtie++'
            mail.send_mail(subject, message, 'no-reply@Bowtie', [request.data['email']],
                fail_silently=False)

        return response


class CreateTokenView(ObtainAuthToken):
    """Create a new auth token for user"""
    serializer_class = AuthTokenSerialize
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


class ManageUserViews(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""
    serializer_class = UserSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated, HasConfirmedEmail, HasNotResetPassword)

    def get_object(self):
        """Retrieve and return authenticated user"""
        return self.request.user



class ActivateAccount(APIView):
    """Activate a users account"""    

    def get(self, request, uidb64, token):
        """ Confirm the creation of an user account"""

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e:
            user = None

        # check the validity of the token
        if user is not None and AccountActivationTokenGenerator.check_token(user, token):
            # Activation of the user
            user.is_active = True
            user.profile.email_confirmed = True  # and we're changing the boolean field so that the token link becomes invalid
            user.save()
            login(user)
            return Response(status=status.HTTP_200_OK)

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # @TODO - redirect to home page of bowtie


class PasswordReset(APIView):
    """ View for password reset request of a user """

    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (not permissions.IsAuthenticated, HasConfirmedEmail, not HasNotResetPassword)
   
    def post(self, request):

        email = request.data['email']
        user = get_user_model().objects.filter(email=email).first()
        if user is not None:
            user.is_active = False # User needs to be inactive for the reset password duration
            user.profile.password_reset = True
            user.save()
            token = PasswordResetToken().make_token(user)  # generate an activation token for the user         
            # Reset message and mail sending
            message = "To reset your account password please click on the following link %s" % (reverse('user:validate-reset') + urlsafe_base64_encode(user.pk) + '/' + token)
            subject = 'Reset password for Bowtie++'
            res = mail.send_mail(subject, message, 'no-reply-Bowtie++', email, fail_silently=False)

        return  Response(status=status.HTTP_200_OK)
  

class ValidatePasswordReset(APIView):
    """View for password reset request validation - update the user with a new password """
    
    def post(self, request, uidb64, token):

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            user = None
            print(e_ex)

        if user is not None and PasswordResetToken().check_token(user, token):
            password = request.data['password']
            try:
                user.set_password(password)
                user.is_active = True
                user.profile.reset_password = False # invalidates the token
                user.save()
                return Response(status=status.HTTP_200_OK)
            except ValidationError as err_valid:
                if hasattr(err_valid, 'message'):
                    data = err_valid.message
                else:
                    data = err_valid
                return Response(status=status.HTTP_400_BAD_REQUEST, data=data)
        elif user is not None:
            return Response(status=status.HTTP_400_BAD_REQUEST, data="Your token has expired")
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
