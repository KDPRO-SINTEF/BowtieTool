### Module for generating tokens for password reset feature and confirm account via email feature
import os
import binascii
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # for compatibility
from django.conf import settings
from django.utils.crypto import constant_time_compare
from django.utils.http import base36_to_int, int_to_base36
from datetime import datetime
from rest_framework.authentication import TokenAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import exceptions
from datetime import timedelta
from core.models import NonceToToken
from django.db.utils import IntegrityError
import pytz

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    """ Generation of tokens for email confirmation.
       An  email confirmation will invalidate the token
    """

    def __init__(self):
        super()
        self.key_salt = settings.SALT_CONFIRM_MAIL
        self.secret  = settings.SECRET_KEY_CONFIRM

    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.email_confirmed)
        )


class PasswordResetToken(PasswordResetTokenGenerator):
    """Generation of tokens for password reset.
       A password reset will invalidate the token
    """

    def __init__(self):
        super()
        self.key_salt = settings.SALT_RESET_PASSWORD
        self.secret = settings.SECRET_KEY_RESET

    def _make_hash_value(self, user, timestamp):
        """Producing the token"""

        login_timestamp = user.profile.last_login
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(login_timestamp)  +
            six.text_type(user.password)
        )



class TOTPValidityToken(PasswordResetTokenGenerator):
    """A token generator for TOTP confirmation time limit
       base from https://github.com/django/django/blob/master/django/contrib/auth/tokens.py
    """

    def __init__(self):
        super()
        self.key_salt = settings.TOTP_CONFIRM_SALT
        self.secret = settings.SECRET_KEY_TOTP

    def make_token(self, user):
        """
        Return a token that can be used once to do a password reset
        for the given user.
        """
        return self._make_token_with_timestamp(user, self._num_seconds(self._now()))

    def _make_hash_value(self, user, timestamp):
        """Producing a new TOTP token """

        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.two_factor_enabled)
        )


    def check_token(self, user, token):
        """
        Check that a password reset token is correct for a given user.
        """
        if not (user and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            tsb36_toint = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        if not constant_time_compare(self._make_token_with_timestamp(user,  tsb36_toint), token):
            return False

        # Check the timestamp is within limit.
        if (self._num_seconds(self._now()) -  tsb36_toint) > int(settings.
            TOTP_CONFIRM_RESET_TIMEOUT):
            return False

        return True

    def _num_seconds(self, dt):
        return int((dt - datetime(2001, 1, 1)).total_seconds())

    def _now(self):
        return datetime.now()


class ExpiringTokenAuthentication(TokenAuthentication):
    """Class extending the normal token authentication in RESTFUL Django
       by adding a validity time defined in the settings module
    """

    def authenticate_credentials(self, key):
        """Check the validity of the token used for authentication"""
        model = self.get_model()

        try:
            token = model.objects.get(key=key)
        except model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')

        if not token.user.is_active:
            raise exceptions.AuthenticationFailed('User inactive or deleted')

        # This is required for the time comparison
        utc_now = datetime.utcnow()
        utc_now = utc_now.replace(tzinfo=pytz.UTC)
        if token.created < utc_now - timedelta(
            hours=int(settings.AUTHENTICATION_TOKEN_EXPIRE_HOURS),
            seconds=int(settings.AUTHENTICATION_TOKEN_EXPIRE_SECONDS)):
            raise exceptions.AuthenticationFailed('Token has expired')

        return token.user, token

    def __str__(self):
        return "Expiring token class"



def create_random_user_id(userid, nbytes=64):
    """Creation of a record nonce-id for activation account and password resset links"""

    try:
        nonce = binascii.hexlify(os.urandom(nbytes)).decode('ascii')
        existing_record = NonceToToken.objects.filter(uid=userid).first()
        if existing_record:
            existing_record.delete()
        obj = NonceToToken(uid=userid, nonce=nonce)
        obj.save()
    except IntegrityError: # eventual problem with random generator?
        return None

    return nonce

def find_user_id_from_nonce(nonce):
    """ (create_random_user_id )^-1"""

    existing_record = NonceToToken.objects.filter(nonce=nonce).first()
    uid = None
    if existing_record:
        uid = existing_record.uid
        existing_record.delete()
    return uid