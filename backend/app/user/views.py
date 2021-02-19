import base64
from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from user.serializers import UserSerializer, AuthTokenSerialize
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
from django.forms import ValidationError
import django.contrib.auth.password_validation as validators
from core.models import Profile, User
from rest_framework.authtoken.models import Token
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.shortcuts import redirect
import datetime
import qrcode

from django.utils import timezone

IMAGE_PATH = "/app/media/QR/token_qr.png"
REDIRECT_ACCOUNT = "http://localhost:8080/app/bowtie++/templates/login.html"
TWO_FACTOR_URL = "http://localhost:8080/app/bowtie++/templates/validate_TOTP.html/?id=%s&token=%s"
PASSWORD_RESET_URL = "http://serveur-ip/app/bowtie++/templates/reset_password.html/?id=%s&token=%s"

# User creation and authentication logic
class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system"""
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):

        response = super().create(request=request, *args, **kwargs)
        if response:
            user = get_user_model().objects.filter(email=request.data['email']).first()
            # generate an activation token for the user
            token = AccountActivationTokenGenerator().make_token(user)
            message = "To activate your account please click on the following link http://localhost:8080%s" % (
                reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token}))
            subject = 'Activate account for Bowtie++'
            mail.send_mail(subject, message, 'no-reply@Bowtie', [request.data['email']],
                fail_silently=False)

        return response

class CreateTokenView(ObtainAuthToken):
    """Create a new authentication token for user"""
    serializer_class = AuthTokenSerialize
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
    permission_classes = (HasConfirmedEmail,)

    def post(self, request, *args, **kwargs):

        serializer = AuthTokenSerialize(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # if user has enabled 2 fa redirect the login
        if user.profile.two_factor_enabled:
            token = TOTPValidityToken().make_token(user)
            redirect(TWO_FACTOR_URL % (urlsafe_base64_encode(force_bytes(user.pk), token)))

        else:
            token, created = Token.objects.get_or_create(user=user)
            if not created:
                # update the created time of the token to keep it valid
                token.created = timezone.now()
                token.save()
            return Response({'token': token.key}, status=status.HTTP_200_OK)


class ManageUserViews(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""
    serializer_class = UserSerializer
    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return authenticated user"""
        return self.request.user


# User account confirmation and password reset logic
class ActivateAccount(APIView):
    """Activate a users account"""

    def get(self, request, uidb64, token):
        """ Confirm the creation of an user account"""

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_valid:
            print(e_valid)
            user = None
        # check the validity of the token
        if user is not None and AccountActivationTokenGenerator().check_token(user, token):
            # Activation of the user
            User.objects.filter(email=user.email).update(is_active=True)
            # and we're changing the boolean field so that the token link becomes invalid
            Profile.objects.filter(user=user).update(email_confirmed=True)
            user.profile.email_confirmed = True
            return redirect(REDIRECT_ACCOUNT)

        return Response(status=status.HTTP_400_BAD_REQUEST)



class PasswordReset(APIView):
    """ Route for password reset request of a user"""

    def post(self, request):
        """Post method for password reset. It takes a JSON with the user's email"""

        email = request.data['email']

        user = get_user_model().objects.filter(email=email).first()
        if not user is None:
            # generate an activation token for the user
            token = PasswordResetToken().make_token(user)
            # Reset message and mail sending
            message = "To activate your account please click on the following link %s" % (
                PASSWORD_RESET_URL % (urlsafe_base64_encode(force_bytes(user.pk)), token))

            subject = 'Reset password for Bowtie++'
            mail.send_mail(subject, message, 'no-reply-Bowtie++', [email], fail_silently=True)

        return  Response(status=status.HTTP_200_OK)


class ValidatePasswordReset(APIView):
    """View for password reset request validation - update the user with a new password """

    def post(self, request, uidb64, token):
        """Post method for password reset"""

        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            user = None
            print(e_ex)
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if user is not None and PasswordResetToken().check_token(user, token):
            user.is_active = False # User needs to be inactive for the reset password duration
            try:
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

        elif user is not None:
            user.is_active = False # User needs to be inactive for the reset password duration
            return Response(status=status.HTTP_400_BAD_REQUEST, data="Your token has expired")

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

# Two factor authentication logic

def get_user_totp_device(user, confirmed=None):
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
        device = get_user_totp_device(user)
        if not device:
            device = user.totpdevice_set.create(confirmed=False)

        # url = device.config_url
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

        # check if request is made in the permitted time
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist) as e_ex:
            user = None
            # TODO log the exception
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not TOTPValidityToken().check_token(user, token):
            return Response(dict(
           errors=['Expired token']),
                status=status.HTTP_400_BAD_REQUEST
            )

        device = get_user_totp_device(self, user)
        if not device or not device.confirmed:
            return Response(dict(
           errors=['This user has not setup two factor authentication']),
                status=status.HTTP_400_BAD_REQUEST
            )

        if device.verify_token(token):
            token, created = Token.objects.get_or_create(user=user)
            if created:
                return Response({"token": token.key}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)

class VerifyTOTPView(APIView):
    """Endpoint for validation of TOTP otpion"""

    authentication_classes = (ExpiringTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, token):
        """Activate the device of authenticated user given a totp token in the post request
           which validation period is defined by token
        """

        user = request.users
        if not TOTPValidityToken().check_token(user, token):
            return Response(dict(
           errors=['Validation token expired']),
                status=status.HTTP_400_BAD_REQUEST
            )

        device = get_user_totp_device(self, user)
        if not device:
            return Response(dict(
           errors=['This user has not setup two factor authentication']),
                status=status.HTTP_400_BAD_REQUEST
            )

        if not "token_totp" in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token_totp = request.data["token_totp"]
        if device.verify_token(token_totp) and not device.confirmed:

            device.confirmed = True
            device.save()
            user.profile.two_factor_enabled = True
            user.save()
            user.profile.save()
            return Response({"token": token.key}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)
