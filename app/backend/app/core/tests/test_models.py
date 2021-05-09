from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from core import models


def sample_user(email='test@bowtie.com', password='123456789Aa!'):
    """create a sample user"""
    return get_user_model().objects.create_user(email, password)

class Modeltests(TestCase):
    """Test for models"""

    def test_create_user_with_email_successful(self):
        """test creating a new user with an email is successful"""
        email = 'test@bowtie.com'
        password = 'testpassS123#'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
    ### Password validators tests ###
    def test_create_user_password_not_containing_special(self):
        """ test if the user has respected the required password pattern (special char) """

        email = 'test@bowtie.com'
        password = 'testpassS123'
        with self.assertRaises(ValidationError) as exception:
            user = get_user_model().objects.create_user(
                email=email,
                password=password)

    def test_create_user_password_not_containing_uppercase(self):
        """ test if the user has respected the required password pattern  (uppercase)"""

        email = 'test@bowtie.com'
        password = 'testpass#123'
        with self.assertRaises(ValidationError) as exception:
            user = get_user_model().objects.create_user(
                email=email,
                password=password)

    def test_create_user_password_not_enough_long(self):
        """ test if the user has respected the required password pattern  (length >= 9)"""

        email = 'test@bowtie.com'
        password = 'tE#'
        with self.assertRaises(ValidationError) as exception:
            user = get_user_model().objects.create_user(
                email=email,
                password=password)
            self.assertEqual(user, None)

    def test_create_user_password_not_containing_lowercase(self):
        """ test if the user has respected the required password pattern  (length >= 9)"""

        email = 'test@bowtie.com'
        password = 'TE#EEEEEEEEEE'
        with self.assertRaises(ValidationError) as exception:
            user = get_user_model().objects.create_user(
                email=email,
                password=password)
            self.assertEqual(user, None)


    def test_create_user_with_default_profile(self):
        """create user with default profile (password not reset, mail not confirmed)"""
        email = 'test@bowtie.com'
        password = 'testpassS123#'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)
        self.assertIsNotNone(user.profile)
        self.assertEqual(False, user.profile.email_confirmed)
        #self.assertEqual(None, user.profile.last_login)


    def test_new_user_email_normalized(self):
        """test the email of new user is normalized"""
        email = 'test@bowtie.COM'
        user = get_user_model().objects.create_user(email, 'testpassS123#')

        self.assertEqual(user.email, email.lower())

    def test_new_user_invalid_email(self):
        """Test creating user with invalid email raises error"""
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(None, 'testpassS123#')

    def test_create_new_superuser(self):
        """Create a new superuser test"""
        user = get_user_model().objects.create_superuser(
            'test@bowtie.com',
            'testpassS123#'
        )
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)


    def test_diagram_str(self):
        diagram = models.Diagram.objects.create(
            owner=sample_user(),
            name="test_diagram"
        )

        self.assertEqual(str(diagram), diagram.name)
