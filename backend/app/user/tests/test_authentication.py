from django.test import TestCase
from django.contrib.auth import get_user_model
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken, TOTPValidityToken
import time
from django.conf import settings

class AuthenticationTests(TestCase):
    """Test for authentication classes"""


    # TOTP token tests
    def test_token_valid_generation(self):

        email = 'test@bowtie.com'
        password = 'testpassS123#'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)
        token = TOTPValidityToken().make_token(user)
        self.assertTrue(TOTPValidityToken().check_token(user, token))


    def test_token_difference_in_time(self):
        """Check if value of tokens change, when time changes"""

        email = 'test@bowtie.com'
        password = 'testpassS123#'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)
        token = TOTPValidityToken().make_token(user)
        time.sleep(1)
        token2 = TOTPValidityToken().make_token(user)
        print(token, token2)
        self.assertTrue(token != token2)


    def test_check_validity_token(self):
        """Check if the validity is confom with the one 
            defined in the settings module
        """
        email = 'test@bowtie.com'
        password = 'testpassS123#'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)
        settings.TOTP_CONFIRM_RESET_TIMEOUT = "2"
        token = TOTPValidityToken().make_token(user)
        time.sleep(3)
        self.assertFalse(TOTPValidityToken().check_token(user, token))
