### Module for generating tokens for password reset feature and confirm account via email feature
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # for compatibility
from django.conf import settings

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
