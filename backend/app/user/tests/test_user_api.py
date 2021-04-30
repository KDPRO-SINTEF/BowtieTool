import time
import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from core.models import Profile, NonceToToken
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.settings import api_settings as settings
from django.core import mail
from user.authentication import AccountActivationTokenGenerator, PasswordResetToken
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django_otp import devices_for_user
from django.db import transaction
from django.db.utils import IntegrityError

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
            'username': 'Test-name'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # check user object is returned
        user = get_user_model().objects.filter(email=payload['email']).first()

        # check password is correct
        self.assertTrue(user.check_password(payload['password']))


    def test_user_missing_username(self):

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", res.data["errors"])


    def test_user_invalid_username(self):

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': '<><>!2#'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", res.data["errors"])


    def test_create_user_invalid_email(self):
        """Check if correct exception is raised for invalid email(response)"""
        payload = {
            'email': 'mkirovinsaa-rennes.fr',
            'password': '123456789a!',
            'username': 'Test-name'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data["errors"])
        self.assertEqual("Invalid field", res.data["errors"]["email"])

    def test_create_user_invalid_password(self):
        """Check if correct exception is raised for invalid password (response)"""
        payload = {
            'email': 'mkirov@insaa-rennes.fr',
            'password': '123456789aa!',
            'username': 'Test-name'
        }

        payload2 = {
            'email': 'mkirov@insaa-rennes.fr',
            'password': '123456789AA!',
            'username': 'Test-name'
        }

        payload3 = {
            'email': 'mkirov@insaa-rennes.fr',
            'password': 'aaaaaaaaAaa!',
            'username': 'Test-name'
        }

        payload4 = {
            'email': 'mkirov@insaa-rennes.fr',
            'password': '123456789AAA',
            'username': 'Test-name'
        }


        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data["errors"])
        self.assertEqual("Invalid field", res.data["errors"]["password"])

        res = self.client.post(CREATE_USER_URL, payload2)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data["errors"])
        self.assertEqual("Invalid field", res.data["errors"]["password"])

        res = self.client.post(CREATE_USER_URL, payload3)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data["errors"])
        self.assertEqual("Invalid field", res.data["errors"]["password"])

        res = self.client.post(CREATE_USER_URL, payload4)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data["errors"])
        self.assertEqual("Invalid field", res.data["errors"]["password"])


    # todo test for integrity error -> https://stackoverflow.com/questions/21458387/transactionmanagementerror-you-cant-execute-queries-until-the-end-of-the-atom
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

    # def test_create_existing_user(self):
    #     """Test creating user that already exists"""
    #     payload = {
    #         'email': 'test@bowtie.com',
    #         'password': '123456789A#a',
    #         'username': 'username'
    #     }
    #     user = create_user(**payload)
    #     user.profile.email_confirmed = True
    #     user.save()
    #     user.profile.save()
    #     res = self.client.post(CREATE_USER_URL, payload)
    #     self.assertEqual(status.HTTP_201_CREATED, res.status_code)
    #     message = "Someone tried to create an account into Bowtie++ using " + \
    #         "this email who is already registered." + \
    #         " If you forgot your password please use the reset link on our login page.\n"+\
    #         "Sincerly, \n Bowtie++ team"
    #     subject = 'Account creation with existing email'

    #     self.assertEqual(len(mail.outbox), 1)
    #     self.assertEqual(mail.outbox[0].subject, subject)
    #     self.assertEqual(mail.outbox[0].body, message)
    #     self.assertEqual(mail.outbox[0].to, ['test@bowtie.com'])


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
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_token_no_user(self):
        """Token is not created for nonexistent user"""
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_token_missing_field(self):
        """Test that  email, password and username are required"""
        payload = {
            'email': 'test',
            'password': ''
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)



    def test_alter_activation_token(self):
        """Create user and then alter the activation token"""

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789aA!',
            'username': 'Test-name'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email="mkirov@insa-rennes.fr").first()
        token = AccountActivationTokenGenerator().make_token(user)
        token += "a"
        record = NonceToToken.objects.filter(uid=user.id).first()
        url = reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(record.nonce)),
                    'token': token})
        res = self.client.get(url)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)


    def test_alter_random_id_activation_token(self):
        """Create user and then alter the activation token"""

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789aA!',
            'username': 'Test-name'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email="mkirov@insa-rennes.fr").first()
        token = AccountActivationTokenGenerator().make_token(user)
        record = NonceToToken.objects.filter(uid=user.id).first()
        record.nonce += "a"
        url = reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(record.nonce)),
                    'token': token})
        res = self.client.get(url)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)
        # test if putting the user id will work
        url = reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(record.uid)),
                    'token': token})
        res = self.client.get(url)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)


    def test_account_activation_token(self):
        """ Test if account activation token is valid and the request
            to the generated url activates user account
        """

        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertFalse(user.profile.email_confirmed)
        token = AccountActivationTokenGenerator().make_token(user)
        record = NonceToToken.objects.filter(uid=user.id).first()
        url = reverse('user:confirm',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(record.nonce)),
                    'token': token})
        res = self.client.get(url)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertTrue(user.profile.email_confirmed)

        # test that the token is invalidated after confirmation
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


    def test_account_password_reset_token(self):
        """ Test if account reset password token is valid and the request
            to the generated url changes user password
        """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
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


    def test_account_password_reset_token_not_confirmed_email(self):
        """ Test if account reset password token is valid and the request
            to the generated url changes user password
        """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
        }
        self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }
        res = self.client.post(reverse("user:reset"), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_password_reset_dont_invalidates_account_confirmation_token(self):
        """Request for password reset doesn't have to invalidate account activation token if
            the use hasn't still confirmed it's account
        """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789aA!',
            'username': 'Test-name'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        user = get_user_model().objects.filter(email=payload['email']).first()
        record = NonceToToken.objects.filter(uid=user.id).first()
        payload = {
            'email': 'mkirov@insa-rennes.fr'
        }

        res = self.client.post(reverse("user:reset"), payload)
        record2 = NonceToToken.objects.filter(uid=user.id).first()
        self.assertTrue(record.uid == record2.uid and record2.nonce == record.nonce)

    def test_account_password_reset_token_nomail(self):
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
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
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_account_password_reset_token_randommail(self):

        payload = {
            'email': "sdaadkjadsa2321@asd.com"
        }
        res = self.client.post(reverse("user:reset"), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_response_time_existing_unexisting_emails(self):
        """Test the response time for password reset request for existing
            and unexisting user """
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        create_user(**payload)
        payload.pop('password')
        payload2 = {
            'email': 'mkirov@insa-rennes.fr'
        }

        start1 = datetime.datetime.now()
        self.client.post(reverse("user:reset"), payload)
        end1 = datetime.datetime.now()
        start2 = datetime.datetime.now()
        self.client.post(reverse("user:reset"), payload2)
        end2 = datetime.datetime.now()
        difference = ((end1-start1) - (end2-start2)).total_seconds()
        self.assertTrue( difference <= 0.1 )

    def test_password_reset_with_token(self):
        """ Test the password change with a valid token """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
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
        record = NonceToToken.objects.filter(uid=user.id).first()
        url = reverse('user:validate-reset',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(record.nonce)),
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

    def test_password_reset_with_no_token(self):
        """ Test the password change without token """
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
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
        url = "http://localhost:8000/api/user/reset/%s/%s" % (urlsafe_base64_encode(
            force_bytes(user.pk)), "")
        payload = {
            'password': '123456789Aa#1',
        }

        res = self.client.post(url, payload)
        user = get_user_model().objects.filter(email='mkirov@insa-rennes.fr').first()
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(user.check_password('123456789Aa#1'))

    def test_password_change_with_token_fail(self):
        """ Test the password change with invlid passwords"""
        payload = {
            'email': 'mkirov@insa-rennes.fr',
            'password': '123456789Aa#',
            'username': 'Test-name'
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
            'username': 'Test-name'
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
            'username': 'Test-name'
        }
        res = self.client.post(TOKEN_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        url = reverse('user:validate-reset',
                    kwargs={'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': token})
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


    def test_delete_user_ok(self):
        """Test for deleting user"""

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
        url = reverse('user:delete')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.post(url, {"password": payload['password']})
        # token isn't expired
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertEqual(None, user)


    def test_delete_user_nok(self):
        """Test if deleting user fails if a wrong password or an empty field
            is submitted
        """
        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = get_user_model().objects.create_user(**payload)
        Profile.objects.filter(user=user).update(email_confirmed=True)

        res = self.client.post(TOKEN_URL, payload)
        token = res.data['token']
        url = reverse('user:delete')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.post(url, {'email':'what'})
        # token isn't expired
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        res = self.client.post(url, {"password":    "123456789A!a"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertNotEqual(None, user)

        def test_delete_user_nok3(self):
            """Bad formed request for deleting user"""
            payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
            }
            user = get_user_model().objects.create_user(**payload)
            Profile.objects.filter(user=user).update(email_confirmed=True)

            res = self.client.post(TOKEN_URL, payload)
            token = res.data['token']
            url = reverse('user:delete')
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
            res = self.client.post(url, {})

    def test_update_password_user_nok1(self):
        """Update psasword for not unauthenticated user
            or incorrect method"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }
        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        token = res.data['token']

        url = reverse('user:update-password-view')

        # request without token authentication
        res = self.client.put(url, {'old_password':'what'})
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, res.status_code)


        # bad request - post
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.post(url, {'old_password':'what'})
        self.assertEqual(status.HTTP_405_METHOD_NOT_ALLOWED, res.status_code)



    def test_update_password_user_nok2(self):
        """Update password with invalid JSON data"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }

        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        token = res.data['token']
        url = reverse('user:update-password-view')
        # request with incorrect JSON format
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # invalid field names
        res = self.client.put(url, {'old_passwordd':'what', 'new_password': "what" })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)



    def test_update_password_nok3(self):
        """Invalid password reset for requests with missing fields"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }

        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        token = res.data['token']
        url = reverse('user:update-password-view')
        # request with incorrect JSON format
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # invalid number of fields
        res = self.client.put(url, {'old_password':'what' })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)
        res = self.client.put(url, {'new_password': "what" })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)


    def test_update_password_nok4(self):
        """Invalid password reset with invalid old/new password"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }

        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        token = res.data['token']
        url = reverse('user:update-password-view')
        # request with incorrect JSON format
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # invalid old password
        res = self.client.put(url, {'old_password':'123456789A#aa', 'new_password': "123456789A#aa" })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)

        #invalid new password
        res = self.client.put(url, {'old_passwordd':'123456789A#a', 'new_password': "123456789A#"})
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)

    def test_update_password_ok(self):
        """Successfully updated password"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }

        user = create_user(**payload)

        Profile.objects.filter(user=user).update(email_confirmed=True)
        res = self.client.post(TOKEN_URL, payload)

        token = res.data['token']
        url = reverse('user:update-password-view')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        res = self.client.put(url, {'old_password':'123456789A#a', 'new_password': "123456789A#a!"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # check if the mail is send correctly
        message = "Your Bowtie++ account password has been changed. If you're familiar with this activity, " + \
            "you can discard this email. Otherwise, we suggest you to immediatly change your " + \
            "password at http://localhost:8080/app/bowtie/common/authentication.html#password-reset.\n\n" + \
            "Sincerly, \n\n Bowtie++ team"
        subject = 'Changed password for Bowtie++'
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, subject)
        self.assertEqual(mail.outbox[0].body, message)
        self.assertEqual(mail.outbox[0].from_email, 'no-reply@Bowtie')
        self.assertEqual(mail.outbox[0].to, [user.email])

        # old password
        user = get_user_model().objects.filter(email=payload['email']).first()
        self.assertFalse(user.check_password("123456789A#a"))
        self.assertTrue(user.check_password('123456789A#a!'))



