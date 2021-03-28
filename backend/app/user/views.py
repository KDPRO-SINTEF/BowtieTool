import base64
from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from user.serializers import UserSerializer, AuthTokenSerialize, UserUpdateSerialize, UserInfoSerializer, PasswordResetSerializer
from user.customPermission import HasConfirmedEmail
from django.core import mail
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken, TOTPValidityToken, ExpiringTokenAuthentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, login
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from rest_framework.exceptions import ValidationError
import django.contrib.auth.password_validation as validators
from core.models import Profile, User
from rest_framework.authtoken.models import Token
from django_otp import devices_for_user, user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.shortcuts import redirect
import datetime
import qrcode
from django.utils import timezone
from django.contrib.auth import authenticate
import logging
from django.db.utils import IntegrityError

logger = logging.getLogger(__name__)

IMAGE_PATH = "/app/media/QR/token_qr.png"
CONFIRM_REDIRECT = "http://localhost:8080/app/bowtie/validation.html?for=email_confirm&id=%s&token=%s"
REDIRECT_LOGIN = "http://localhost:8080/app/bowtie++/common/authentication.html#login"
PASSWORD_RESET_URL = "http://localhost:8080/app/bowtie/validation.html?for=reset_pwd&id=%s&token=%s"
PASSWORD_RESET_REQUEST_URL = "http://localhost:8080/app/bowtie/common/authentication.html#password-reset"


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
            headers = self.get_success_headers(serializer.data)
            user = get_user_model().objects.filter(email=request.data['email']).first()
            token = AccountActivationTokenGenerator().make_token(user)
            message = "To activate your Bowtie++ account, please click on the following link %s" % (
                CONFIRM_REDIRECT % (urlsafe_base64_encode(force_bytes(user.pk)), token))
            subject = 'Activate account for no-reply-Bowtieowtie++'
            logger.info('Account with email : %s created on: %s', user.email, timezone.now())
            send_mail(subject, message, user.email)

        except (ValidationError, AssertionError, IntegrityError) as error_validation:

            if not isinstance(error_validation, IntegrityError):
                return Response(dict(errors=error_validation.detail),
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

            else:
                token = AccountActivationTokenGenerator().make_token(user)

                message = "To activate your account please click on the following link %s" % (
                    CONFIRM_REDIRECT % (urlsafe_base64_encode(force_bytes(user.pk)), token))

                mail.send_mail(subject, message, 'no-reply@Bowtie', [request.data['email']],
                    fail_silently=False)

        return Response(status=status.HTTP_201_CREATED)



class CreateTokenView(ObtainAuthToken):
    """Create a new authentication token for user"""
    serializer_class = AuthTokenSerialize
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
                return Response({"uidb64": urlsafe_base64_encode(force_bytes(user.pk)), "token": token},
                    status=status.HTTP_200_OK)


            token, created = Token.objects.get_or_create(user=user)
            if not created:
                # update the created time of the token to keep it valid
                token.created = timezone.now()
                token.save()

            logger.info("User with email %s logs at %s", user.email, timezone.now())

            return Response({'token': token.key}, status=status.HTTP_200_OK)
        except ValidationError as e:
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
        "password at http://localhost:8080/app/bowtie/common/authentication.html#password-reset.\n\n" + \
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
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_valid:
            logger.warning(e_valid)
            user = None
        # check the validity of the token
        if not user is None and AccountActivationTokenGenerator().check_token(user, token):
            # Activation of the user
            User.objects.filter(email=user.email).update(is_active=True)
            # and we're changing the boolean field so that the token link becomes invalid
            Profile.objects.filter(user=user).update(email_confirmed=True)
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    def __str__(self):
        return "Endpoint for account activation"


class PasswordReset(APIView):
    """ Route for password reset request of a user"""

    serializer_class = PasswordResetSerializer
    
    def post(self, request):
        """Post method for password reset. It takes a JSON with the user's email"""

        serializer = PasswordResetSerializer(data=request.data, url=PASSWORD_RESET_URL)
        serializer.is_valid(raise_exception=True)
        return  Response(status=status.HTTP_200_OK)

    def __str__(self):
        return "Password reset request endpoint. Accepts a post request containing a mail"

class ValidatePasswordReset(APIView):
    """View for password reset request validation - update the user with a new password """

    def post(self, request, uidb64, token):
        """Post method for password reset"""

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            user = None
            logger.warning("Failed resset password for User with id %s. Exception: %s", uid, e_ex)
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if PasswordResetToken().check_token(user, token):

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

        return Response(status=status.HTTP_400_BAD_REQUEST)

# Two factor authentication logic
def get_user_totp_device(user, confirmed=False):
    """
        Find an existing user totp device and returning it
    """

    devices = devices_for_user(user, confirmed=confirmed)
    for device in devices:
        if isinstance(device, TOTPDevice):
            return device

class TOTPCreateAPIView(APIView):
    """
    Creation of a time based one time password for a user
    """

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def __str__(self):
        return "TOTP create endpoint"

    def get(self, request):
        """TOPT generaton"""

        user = request.user
        if user_has_device(user, confirmed=True):
            return Response(dict(errors=["2FA is already activated on this account"]),
                status=status.HTTP_400_BAD_REQUEST)

        device = get_user_totp_device(user, False)
        if not device:
            device = user.totpdevice_set.create(confirmed=False)
            user.save()

        img = qrcode.make(device.config_url)
        img.save(IMAGE_PATH) # save for further byte reading

        token =  TOTPValidityToken().make_token(user)
        with open(IMAGE_PATH, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')

        return Response({"qrImg": image_data, "token": token}, status=status.HTTP_201_CREATED)




class TOTPAuthenticateView(APIView):
    """
    Use this endpoint to verify a token produced by a TOTP device
    in order to authenticate user
    """

    def __str__(self):
        return "Verification endpoint"


    def post(self, request, uidb64, token):
        """Verify user one-time password"""

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            logger.warning('Unsuccessfull login with id %s. Exception: %s', uid, e_ex)
            return Response(status=status.HTTP_400_BAD_REQUEST)


        if TOTPValidityToken().check_token(user, token) and ("token_totp" in request.data):

            device = get_user_totp_device(user, True)
            token_totp = request.data["token_totp"]

            if not device or not device.verify_token(token_totp):
                return Response(dict(errors=['This user has not setup two' \
                    + 'factor authentication or has not enter a valid code']),
                    status=status.HTTP_400_BAD_REQUEST
                )

            token, created = Token.objects.get_or_create(user=user)
            if not created:
                # update the created time of the token to keep it valid
                token.created = timezone.now()
                token.save()

            logger.info("User with email %s logs at %s", user.email, timezone.now())
            return Response({'token': token.key}, status=status.HTTP_200_OK)


        return Response(dict(errors=['Expired token']), status=status.HTTP_400_BAD_REQUEST)


class VerifyTOTPView(APIView):
    """Endpoint for validation of TOTP service"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, token):
        """Activate the device of authenticated user given a totp token in the post request
           which validation period is defined by token
        """

        user = request.user
        if not TOTPValidityToken().check_token(user, token):
            return Response(dict(
           errors=['Validation token expired']),
                status=status.HTTP_401_UNAUTHORIZED
            )

        device = get_user_totp_device(user, False)
        if not device:
            return Response(dict(
           errors=['This user has not setup two factor authentication']),
                status=status.HTTP_400_BAD_REQUEST
            )

        if not "token_totp" in request.data:
            return Response(dict(errors=["Need authentication app code"]),
                status=status.HTTP_400_BAD_REQUEST)

        token_totp = request.data["token_totp"]
        if device.verify_token(token_totp):
            device.confirmed = True
            user.profile.two_factor_enabled = True
            device.save()
            user.profile.save()
            user.save()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class DeleteUserView(APIView):
    """Endpoint for deleting user. The user has to be authenticated to perform this action"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        """Deletes the user of the request"""

        if not "password" in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        password = request.data['password']
        if authenticate(request=request, email=user.email, password=password):
            logger.info('User with email %s is deleting its account',user.email)
            user.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


    def __str__(self):
        return "Delete user endpoint"


class DisableTOTP(APIView):
    """Endpoing for disabling 2fa service"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        """Disable device"""
        user = request.user
        device = get_user_totp_device(user, True)

        if not device or not device.confirmed:
            logger.warning("Suspicious 2FA desactivation - no 2FA or 2FA not activated for user %s",
                user)
            return Response(dict(errors=["Ivalid operation"]), status=status.HTTP_400_BAD_REQUEST)

        if not "token_totp" in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token_totp = request.data["token_totp"]
        if not device.verify_token(token_totp):
            return Response(dict(errors=["Invalid code"]), status=status.HTTP_400_BAD_REQUEST)

        TOTPDevice.objects.filter(user=user).delete()
        user.profile.two_factor_enabled = False
        user.profile.save()
        user.save()
        return Response(status=status.HTTP_200_OK)
