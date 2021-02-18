### Module for generating tokens for password reset feature and confirm account via email feature
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # for compatibility
from django.conf import settings
from django.utils.crypto import constant_time_compare
from django.utils.http import base36_to_int, int_to_base36
from datetime import datetime


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
        # Used for mocking in tests
        return datetime.now()