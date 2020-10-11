from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
# to generate api url

from rest_framework.test import APIClient
# test client used to make requests to api and check response
from rest_framework import status
# to get human readable form of status codes


CREATE_USER_URL = reverse('user:create')
TOKEN_URL = reverse('user:token')

def create_user(**params):
    return get_user_model().objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Test unauthenticated users api"""

    def setUp(self):
        self.client = APIClient()

    def test_create_valid_user_success(self):
        """Test creating with valid payload"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789',
            'first_name': 'Test name'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # check user object is returned
        user = get_user_model().objects.get(**res.data)

        # check password is correct
        self.assertTrue(user.check_password(payload['password']))

        # check password is not returned
        self.assertNotIn('password', res.data)

    def test_user_duplicate(self):
        """Test creating user that already exists"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789'
        }
        create_user(**payload)

        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_short(self):
        """Test if password is lesser than 8 chars"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '12345'
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        """Test for successful creation of token for user"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789'
        }
        create_user(**payload)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_token_invalid_credentials(self):
        """Token is not created for invalid credentials"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789'
        }
        create_user(**payload)
        payload['password'] = 'wrongpassword'
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_no_user(self):
        """Token is not created for nonexistent user"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789'
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_missing_field(self):
        """Test that email and password are required"""
        payload = {
            'email': 'test',
            'password': ''
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)