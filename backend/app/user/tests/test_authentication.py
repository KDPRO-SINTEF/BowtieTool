from user.authentication import find_user_id_from_nonce, create_random_user_id
from django.test import TestCase
from core.models import Profile, NonceToToken
from django.contrib.auth import get_user_model
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken, TOTPValidityToken
import time
from django.conf import settings
from django.utils import timezone
from core.models import Profile
from rest_framework.test import APIClient
from django.urls import reverse
from rest_framework import status
from rest_framework.settings import api_settings


TOKEN_URL = reverse('user:token')

class AuthenticationTests(TestCase):
    """Test for authentication classes"""

    def setUp(self):
        """Test setup"""
        self.client = APIClient()

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
        self.assertTrue(token != token2)


    def test_check_validity_totp_token(self):
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


    def test_check_validity_authentication_token_expired(self):
        """Check the validity of the authentication token"""

        # setting the token validity for 2 seconds
        settings.AUTHENTICATION_TOKEN_EXPIRE_HOURS=0
        settings.AUTHENTICATION_TOKEN_EXPIRE_SECONDS=2

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = get_user_model().objects.create_user(**payload)
        Profile.objects.filter(user=user).update(email_confirmed=True)

        res = self.client.post(TOKEN_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        # add the auth token to the header of the APIClient object
        token = res.data['token']
        url = reverse('user:totp-create')
        time.sleep(2)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.get(url)
        # token is expired

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_check_validity_authentication_token_ok(self):
        """Check the validity of the authentication token"""

        # setting the token validity for 2 seconds
        settings.AUTHENTICATION_TOKEN_EXPIRE_SECONDS=10
        settings.AUTHENTICATION_TOKEN_EXPIRE_HOURS=0

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = get_user_model().objects.create_user(**payload)
        Profile.objects.filter(user=user).update(email_confirmed=True)

        res = self.client.post(TOKEN_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        # add the auth token to the header of the APIClient object
        token = res.data['token']
        url = reverse('user:me')
        time.sleep(2)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.get(url)
        # token isn't expired
        self.assertEqual(res.status_code, status.HTTP_200_OK)


    def test_same_id_invalidates_an_existing_previous_one(self):
        """Test when adding a new record for an existing userid,
        the old record is deleted
        """

        nonce = create_random_user_id(1)
        self.assertTrue(nonce != None)
        nonce2 = create_random_user_id(1)
        self.assertTrue(nonce != nonce2)
        user = NonceToToken.objects.filter(nonce=nonce).first()
        self.assertTrue(user is None)

    def test_adding_same_id_deletes_previous_record(self):

        nonce = create_random_user_id(1)
        id1 = find_user_id_from_nonce(nonce)
        user = NonceToToken.objects.filter(uid=id1).first()
        self.assertTrue(user is None)
