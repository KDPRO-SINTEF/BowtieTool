from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
# to generate api url
from core.models import Profile
from rest_framework.test import APIClient
# test client used to make requests to api and check response
from rest_framework import status
from django.core import mail 
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken
# to get human readable form of status codes
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

CREATE_USER_URL = reverse('user:create')
TOKEN_URL = reverse('user:token')

def create_user(**params):
    return get_user_model().objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Test unauthenticated users api"""


    def setUp(self):
        """Test setup"""
        self.client = APIClient()
    
    def test_create_valid_user_success(self):
        """Test creating with valid payload"""
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # check user object is returned
        user = get_user_model().objects.filter(email=payload['email']).first()

        # check password is correct
        self.assertTrue(user.check_password(payload['password']))
        # self.assertFalse(user.profile)
        # check password is not returned
        self.assertNotIn('password', res.data)


    def test_send_mail(self):
        """ Test mail send"""

        message = "To activate your account please click on the following link"
        subject = 'Activate account for Bowtie++'
        mail.send_mail(subject, message, 'from@example.com', ["mkirov@insa-rennes.fr"],
            fail_silently=False)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, subject)
        self.assertEqual(mail.outbox[0].body, message)
        self.assertEqual(mail.outbox[0].from_email, 'from@example.com')
        self.assertEqual(mail.outbox[0].to, ['mkirov@insa-rennes.fr'])

    def test_user_duplicate(self):
        """Test creating user that already exists"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        create_user(**payload)

        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_for_user_fail(self):
        """Test for unsuccessful creation of authentification token for user"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        create_user(**payload)

        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


    def test_create_token_for_user_ok(self):
        """Successful creation of authentication token"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)


    def test_create_token_invalid_credentials(self):
        """Token is not created for invalid credentials"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = create_user(**payload)
        Profile.objects.filter(user=user).update(email_confirmed=True)

        payload['password'] = 'wrongpassword'
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_no_user(self):
        """Token is not created for nonexistent user"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_token_missing_field(self):
        """Test that  email, password and username are required"""
        payload = {
            'email': 'test',
            'password': ''
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_account_activation_token(self):
        """ Test if account activation token is valid and the request
            to the generated url activates user account
        """

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertFalse(user.profile.email_confirmed)
        token = AccountActivationTokenGenerator().make_token(user)
        url = reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token})
        res = self.client.get(url)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertTrue(user.profile.email_confirmed)

        # test that token is invalidated after confirmation
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


    def test_account_password__reset_token(self):
        """ Test if account reset password token is valid and the request
            to the generated url changes user password
        """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        user.profile.email_confirmed = True
        user.save()
        user.profile.save()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }
        res = self.client.post(reverse("user:reset"), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)


    def test_account_password__reset_token_nomail(self):
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        user.profile.email_confirmed = True
        user.save()
        user.profile.save()

        payload = {
            'email': ""
        }
        res = self.client.post(reverse("user:reset"), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    
    def test_password_change_with_token(self):
        """ Test the password change with a valid token """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()

        user.profile.email_confirmed = True
        user.save()
        user.profile.save()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }
        self.client.post(reverse("user:reset"), payload)
        user = get_user_model().objects.filter(email='mkirov@insa-rennes.fr').first()
        token = PasswordResetToken().make_token(user)
        url = reverse('user:validate-reset',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token})
        payload = {
            'password': '123456789Aa#1',
        }
        res = self.client.post(url, payload)
        user = get_user_model().objects.filter(email='mkirov@insa-rennes.fr').first()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(user.check_password('123456789Aa#1'))
        # chek re-use of the token
        user = get_user_model().objects.filter(email='mkirov@insa-rennes.fr').first()
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


    def test_password_change_with_token_fail(self):
        """ Test the password change with invlid passwords"""
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()

        user.profile.email_confirmed = True
        user.save()
        user.profile.save()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }
        self.client.post(reverse("user:reset"), payload)
        user = get_user_model().objects.filter(email='mkirov@insa-rennes.fr').first()
        token = PasswordResetToken().make_token(user)
        url = reverse('user:validate-reset',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token})
        payload = {
            'password': '',
        }
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_change_with_token_error(self):
        """Test if reset password endpoint handles errors"""


    def test_user_reset_password_token_after_login(self):
        """ Test if the password reset token generated by the user ivalidates
            a previous request for password reset
        """

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        user.profile.email_confirmed = True
        user.save()
        user.profile.save()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }
        self.client.post(reverse("user:reset"), payload)
        token = PasswordResetToken().make_token(user)
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test name'
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        url = reverse('user:validate-reset',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token})
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def totp_token_create_test(self):
        """Creating an TOTP token"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)