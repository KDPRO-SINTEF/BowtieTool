### Module for generating tokens for password reset feature and confirm account via email feature
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # for compatibility
from django.conf import settings
from django.utils.crypto import constant_time_compare
from django.utils.http import base36_to_int
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    """ Generation of tokens for email confirmation.
       An  email confirmation will invalidate the token
    """

    def __init__(self):
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
    """A token generator for TOTP confirmation time limit"""

    def __init__(self):
        super()
        self.secret = settings.SECRET_KEY_TOTP

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
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        if not constant_time_compare(self._make_token_with_timestamp(user, ts), token):
            return False

        # Check the timestamp is within limit.
        if (self._num_seconds(self._now()) - ts) > settings.TOTP_CONFIRM_RESET_TIMEOUT:
            return False

        return True
        