from django.test import TestCase
from django.contrib.auth import get_user_model

from core import models


def sample_user(email='test@bowtie.com', password='123456789'):
    """create a sample user"""
    return get_user_model().objects.create_user(email, password)


class Modeltests(TestCase):

    def test_create_user_with_email_successful(self):
        """test creating a new user with an email is successful"""
        email = 'test@bowtie.com'
        password = 'testpass123'
        user = get_user_model().objects.create_user(
            email=email,
            password=password)

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))

    def test_new_user_email_normalized(self):
        """test the email of new user is normalized"""
        email = 'test@bowtie.COM'
        user = get_user_model().objects.create_user(email, 'test123')

        self.assertEqual(user.email, email.lower())

    def test_new_user_invalid_email(self):
        """Test creating user with invalid email raises error"""
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(None, 'test123')

    def test_create_new_superuser(self):
        user = get_user_model().objects.create_superuser(
            'test@bowtie.com',
            'test123'
        )
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_diagram_str(self):
        diagram = models.Diagram.objects.create(
            owner=sample_user(),
            name="test_diagram"
        )

        self.assertEqual(str(diagram), diagram.name)
