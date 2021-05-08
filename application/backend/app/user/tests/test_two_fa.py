import time
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from core.models import Profile
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.settings import api_settings as settings
from django.core import mail
from django_otp import devices_for_user

TOKEN_URL = reverse('user:token')

class TwoFaAPITests(TestCase):
    """Two FA API tests"""

    def setUp(self):
        """Test setup"""
        self.client = APIClient()

    def test_enable_two_fa_user_nok(self):
        """Unauthenticated user can't enable two fa"""

        payload = {
          'email': 'test@bowtie.com',
          'password': '123456789A#a'
        }

        user = get_user_model().objects.create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        # res = self.client.post(TOKEN_URL, payload)
        # token = res.data['token']

        url = reverse("user:totp-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_enable_two_fa_user_data_ok(self):
        """Test if all data returned by two fa activation method is present"""

        payload = {
          'email': 'test@bowtie.com',
          'password': '123456789A#a'
        }

        user = get_user_model().objects.create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)
        token = res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        url = reverse("user:totp-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # temporary token present
        self.assertIn('token', res.data)
        # image present
        self.assertIn('qrImg', res.data)
        devices = devices_for_user(user, confirmed=False)
        self.assertNotEqual(None, devices)

    def test_enable_two_fa_validate_token_validity(self):
        """Test validity of token for validation of user totp device"""
        settings.TOTP_CONFIRM_RESET_TIMEOUT=2

        payload = {
          'email': 'test@bowtie.com',
          'password': '123456789A#a'
        }

        user = get_user_model().objects.create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)
        token = res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        url = reverse("user:totp-create")
        res = self.client.get(url)
        time.sleep(3)
        token_totp_validate = res.data["token"]

        url2 = reverse("user:totp-activate", kwargs={'token':token_totp_validate})
        res2 = self.client.post(url2, {})
        self.assertIn('errors', res2.data)
        self.assertEqual(res2.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_enable_two_fa_validate_invalid_totp_token(self):
        """Test validity of token for validation of user totp device"""

        payload = {
          'email': 'test@bowtie.com',
          'password': '123456789A#a'
        }

        user = get_user_model().objects.create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)
        token = res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        url = reverse("user:totp-create")
        res = self.client.get(url)
        token_totp_validate = res.data["token"]

        url2 = reverse("user:totp-activate", kwargs={'token':token_totp_validate})
        res2 = self.client.post(url2, {"token_totp": "1234"})
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
