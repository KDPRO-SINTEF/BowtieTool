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
from rest_framework.settings import api_settings as settings
import time
from django_otp import devices_for_user

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
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


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


    def test_account_password_reset_token_nomail(self):
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
 

    def test_password_reset_with_token(self):
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

    def test_password_reset_with_no_token(self):
        """ Test the password change without token """
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

    # def totp_token_create_test(self):
    #     """Creating an TOTP token"""
    #     payload = {
    #         'email': 'test@bowtie.com',
    #         'password': '123456789A#a'
    #     }
    #     user = create_user(**payload)

    #     Profile.objects.filter(user=user).update(email_confirmed=True)
    #     res = self.client.post(TOKEN_URL, payload)


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
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        # add the auth token to the header of the APIClient object 
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

        # invalid number of fields
        res = self.client.put(url, {'old_password':'what' })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)
        res = self.client.put(url, {'new_password': "what" })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)

        # invalid old password
        res = self.client.put(url, {'old_passwordd':'123456789A#aa', 'new_password': "what" })
        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)

        #invalid new password 
        res = self.client.put(url, {'old_passwordd':'123456789A#a', 'new_password': "123456789A#" })
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
        message = "You're password has been changed. If you're familiar with this activity" + \
            "you can discard this email. Otherwise we suggest you to immedeatly change your" + \
            "password." + \
            "Sincerly, \n Bowtie++ team"
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


    def test_enable_two_fa_user_nok(self):
        """Unauthenticated user can't enable two fa"""

        payload = {
            'email': 'test@bowtie.com',
            'password': '123456789A#a'
        }

        user = create_user(**payload)

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

        user = create_user(**payload)

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

        user = create_user(**payload)

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

        user = create_user(**payload)

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
# todo test update password, enable, disable two fa, new login logic 