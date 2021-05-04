"""User manage views"""
import datetime
import time
import logging
from rest_framework import generics, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from user.serializers import UserSerializer, AuthTokenSerialize, UserUpdateSerialize, UserInfoSerializer, PasswordResetSerializer, DeleteUserSerializer
from user.customPermission import HasConfirmedEmail
from user.authentication import AccountActivationTokenGenerator, TOTPValidityToken, PasswordResetToken, ExpiringTokenAuthentication, create_random_user_id, find_user_id_from_nonce
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
import django.contrib.auth.password_validation as validators
from core.models import Profile, User, NonceToToken
from django.utils import timezone
from django.db.utils import IntegrityError
from django.contrib.auth import authenticate
import environ

logger = logging.getLogger(__name__)

env = environ.Env()
# reading .env file
environ.Env.read_env()

STATIC_SERVER_URL = env('WEB_PROTOCOL') + "://" + env('STATIC_SERVER_HOST') + ":" + env('STATIC_SERVER_PORT')
CONFIRM_REDIRECT = STATIC_SERVER_URL + "/register/email-confirm?id=%s&token=%s"
REDIRECT_LOGIN = STATIC_SERVER_URL + "/login"
PASSWORD_RESET_URL = STATIC_SERVER_URL + "/password-reset?id=%s&token=%s"
PASSWORD_RESET_REQUEST_URL = STATIC_SERVER_URL + "/password-reset"


def send_mail(subject, message, email, fromm='no-reply@Bowtie'):
    """Send email functiom"""

    mail.send_mail(subject, message, fromm, [email], fail_silently=False)

# User creation and authentication logic
class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system"""
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        """Create a user endpoint"""

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info('Account with email : %s created on: %s',
                request.data["email"], timezone.now())

        except (ValidationError, AssertionError, IntegrityError) as error_validation:

            if not isinstance(error_validation, IntegrityError): # counter data privacy leak
                error_dict = dict()
                key = list(error_validation.detail.keys())[0]
                error_dict[key] = "Invalid field"
                return Response(dict(errors=error_dict),
                    status=status.HTTP_400_BAD_REQUEST)

            user = get_user_model().objects.filter(email=request.data['email']).first()
            if user.profile.email_confirmed:
                logger.warning("Attempt to create account with existing email %s", "")
                message = "Someone tried to create an account into Bowtie++ using " + \
                "this email who is already registered." + \
                " If you forgot your password please use the reset link on our login page.\n"+\
                "Sincerly, \n Bowtie++ team"
                subject = 'Account creation with existing email'
                send_mail(subject, message, user.email)
                return Response(status=status.HTTP_201_CREATED)


        user = get_user_model().objects.filter(email=request.data['email']).first()
        token = AccountActivationTokenGenerator().make_token(user)
        nonce = create_random_user_id(user.id)
        message = "To activate your Bowtie++ account, please click on the following link %s" % (
            CONFIRM_REDIRECT % (urlsafe_base64_encode(force_bytes(nonce)), token))
        subject = 'Activate account for no-reply-Bowtieowtie++'
        send_mail(subject, message, user.email)
        return Response(status=status.HTTP_201_CREATED)

class CreateTokenView(ObtainAuthToken):
    """Create a new authentication token for user"""

    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
    permission_classes = (HasConfirmedEmail,)

    def post(self, request, *args, **kwargs):

        serializer = AuthTokenSerialize(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            # if user has enabled 2 fa redirect the login
            if user.profile.two_factor_enabled:
                token = TOTPValidityToken().make_token(user)
                nonce = create_random_user_id(user.id)
                return Response({"uidb64": urlsafe_base64_encode(force_bytes(nonce)), "token": token},
                    status=status.HTTP_200_OK)


            token, created = Token.objects.get_or_create(user=user)
            if not created:
                # update the created time of the token to keep it valid
                token.created = timezone.now()
                token.save()

            logger.info("User with email %s logs at %s", user.email, timezone.now())

            return Response({'token': token.key}, status=status.HTTP_200_OK)
        except ValidationError:
            return Response(dict(errors=["Invalid credentials"]),
                status=status.HTTP_401_UNAUTHORIZED)


class ManageUserViews(generics.RetrieveAPIView):
    """Manage the authenticated user"""
    serializer_class = UserInfoSerializer
    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return an authenticated user"""
        return self.request.user

    def __str__(self):
        return "User info endpoint"

class UpdatePassword(APIView):
    """Manage the authenticated user"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request):
        user = request.user
        serializer = UserUpdateSerialize(data=request.data, user=user)
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        logger.warning("User %s changed password ", user)
        message = "Your Bowtie++ account password has been changed. If you're familiar with this activity, " + \
        "you can discard this email. Otherwise, we suggest you to immediatly change your " + \
        "password at " + PASSWORD_RESET_REQUEST_URL + ".\n\n" + \
        "Sincerly, \n\n Bowtie++ team"
        subject = 'Changed password for Bowtie++'
        mail.send_mail(subject, message, 'no-reply@Bowtie', [user.email],
            fail_silently=False)
        return Response(status=status.HTTP_200_OK)


    def __str__(self):
        return "Retrieve authenticated user from an API request"

# User account confirmation and password reset logic
class ActivateAccount(APIView):
    """Activate a users account"""

    def get(self, request, uidb64, token):
        """ Confirm the creation of an user account"""

        try:
            nonce = force_text(urlsafe_base64_decode(uidb64))
            uid = find_user_id_from_nonce(nonce)
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_valid:
            logger.warning(e_valid)
            user = None
        # check the validity of the token
        if not user is None and AccountActivationTokenGenerator().check_token(user, token):
            User.objects.filter(email=user.email).update(is_active=True)
            Profile.objects.filter(user=user).update(email_confirmed=True)
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    def __str__(self):
        return "Endpoint for account activation"


class PasswordReset(APIView):
    """ Route for password reset request of a user"""

    serializer_class = PasswordResetSerializer

    def post(self, request):
        """Post method for password reset.
           It takes a JSON with the user's email.
           There is a total time for the method execution to counter
           email info leak. -> method execution time >= 3
        """
        start = datetime.datetime.now()
        serializer = PasswordResetSerializer(data=request.data, url=PASSWORD_RESET_URL)
        serializer.is_valid(raise_exception=True)
        time.sleep(3 - (datetime.datetime.now() - start).total_seconds())
        return  Response(status=status.HTTP_200_OK)

    def __str__(self):
        return "Password reset request endpoint. Accepts a post request containing a mail"

class ValidatePasswordReset(APIView):
    """View for password reset request validation - update the user with a new password """

    def post(self, request, uidb64, token):
        """Post method for password reset"""

        try:
            nonce = force_text(urlsafe_base64_decode(uidb64))
            uid = find_user_id_from_nonce(nonce)
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            logger.warning("Failed resset password for User with id %s. Exception: %s", uid, e_ex)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        data = ""
        if PasswordResetToken().check_token(user, token) and "password" in request.data:

            try:
                user.is_active = False # User needs to be inactive for the reset password duration
                password = request.data['password']
                validators.validate_password(password)
                user.set_password(password)
                user.is_active = True
                user.save()
                user.profile.save()
                return Response(status=status.HTTP_200_OK)

            except ValidationError:
                data = "bad credentials"

        return Response(status=status.HTTP_400_BAD_REQUEST, data=data)


class DeleteUserView(APIView):
    """Endpoint for deleting user. The user has to be authenticated to perform this action"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = DeleteUserSerializer

    def post(self, request):
        """Deletes the user of the request"""

        try:
            user = request.user
            serializer = DeleteUserSerializer(data=request.data, user=user)
            serializer.is_valid(raise_exception=True)
            logger.info('User with email %s is deleting its account',user.email)
            return Response(status=status.HTTP_200_OK)

        except ValidationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def __str__(self):
        return "Delete user endpoint"
