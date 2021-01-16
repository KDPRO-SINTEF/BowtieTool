from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
# to generate api url

from rest_framework.test import APIClient, force_authenticate
# test client used to make requests to api and check response
from rest_framework import status

# to get human readable form of status codes
from core.models import Diagram, DiagramStat



class DiagramConversionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_user = get_user_model().objects.create_user(email='test@bowtie.com', password="123456789")
        self.client.force_authenticate(user=self.test_user)
        diagramStat = DiagramStat.objects.create()
        self.diagram = Diagram.objects.create(name="test_diagram", is_public=True, diagram="<xml>",
                                              owner=self.test_user, diagram_stat=diagramStat)

        self.DIAGRAM_DETAIL_URL = reverse('diagram:my-diagrams', args=(self.diagram.id,))

    def test_get_XML(self):
        """Test creating with valid payload"""
        payload = {
            "export_type": "XML"
        }
        res = self.client.get(self.DIAGRAM_DETAIL_URL, payload)
        self.assertEqual("application/xml", res["content-type"])

    def test_get_PNG(self):
        payload = {
            "export_type": "PNG"
        }
        res = self.client.get(self.DIAGRAM_DETAIL_URL, payload)
        self.assertEqual("application/png", res["content-type"])

