""" Two factor authentication views"""
import os
import base64
import io
import logging
import qrcode
from user.authentication import  TOTPValidityToken, ExpiringTokenAuthentication, create_random_user_id, find_user_id_from_nonce
from rest_framework import  permissions
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.response import Response
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp import devices_for_user, user_has_device
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_text
from django.contrib.auth import get_user_model
from django.utils import timezone

IMAGE_PATH = "/app/media/QR/token_qr.png"
logger = logging.getLogger(__name__)

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

        try:
            img = qrcode.make(device.config_url)
            bytes_image = io.BytesIO()
            img.save(bytes_image, format='PNG')
            bytes_image.seek(0)
            img = base64.b64encode(bytes_image.read()).decode('utf-8')
            token =  TOTPValidityToken().make_token(user)
            return Response({"qrImg": img, "token": token}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)



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
            nonce = force_text(urlsafe_base64_decode(uidb64))
            uid = find_user_id_from_nonce(nonce)
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
