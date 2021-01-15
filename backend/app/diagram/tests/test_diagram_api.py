from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
# to generate api url

from rest_framework.test import APIClient
# test client used to make requests to api and check response
from rest_framework import status

# to get human readable form of status codes

DIAGRAM_DETAIL_URL = reverse('diagram:my-diagrams', args=(1,))


class DiagramConversionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_XML(self):
        """Test creating with valid payload"""
        payload = {
            "export_type": "XML"
        }
        res = self.client.get(DIAGRAM_DETAIL_URL, payload)
        self.assertEqual("XML", res.content_type)

    def test_get_PNG(self):
        payload = {
            "export_type": "XML"
        }
        res = self.client.get(DIAGRAM_DETAIL_URL)
