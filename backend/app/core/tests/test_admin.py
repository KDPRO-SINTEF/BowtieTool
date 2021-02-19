from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
import os

class AdminSiteTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.admin_user = get_user_model().objects.create_superuser(
            email="admin@bowtie.com",
            password='testpassS123#'
        )
        self.client.force_login(self.admin_user)
        self.user = get_user_model().objects.create_user(
            email='test@bowtie.com',
            password='testpassS123#',
            first_name='test name'
        )

    def tearDown(self):
        """Clean the database after each method (probles due to force login probably"""
        print("Here")
        os.system(" echo yes | python3 manage.py flush ")

    def test_users_listed(self):
        """test users are listed on user page"""
        url = reverse('admin:core_user_changelist')
        res = self.client.get(url)

        self.assertContains(res, self.user.last_name)
        self.assertContains(res, self.user.email)

    def test_user_change_page(self):
        """test that user edit page works"""
        url = reverse('admin:core_user_change', args=[self.user.id])
        # /admin/core/user/{id}
        res = self.client.get(url)

        self.assertEqual(res.status_code, 200)

    def test_create_user_page(self):
        """test if create user page works"""
        url = reverse('admin:core_user_add')
        res = self.client.get(url)

        self.assertEqual(res.status_code, 200)
