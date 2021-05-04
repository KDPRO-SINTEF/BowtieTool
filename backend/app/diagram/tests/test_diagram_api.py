from django.core.exceptions import ObjectDoesNotExist
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
# to generate api url

from rest_framework.test import APIClient, force_authenticate
# test client used to make requests to api and check response
from rest_framework import status

# to get human readable form of status codes
from app.settings import MEDIA_URL, MEDIA_ROOT
from core.models import Diagram, DiagramStat
from diagram import serializers


class DiagramApiTests(TestCase):
    """ Test class for all diagram related tests"""

    def setUp(self):
        self.client = APIClient()
        self.email_to_share_with = "test-share@bowtie.com"
        self.test_user = get_user_model().objects.create_user(email='test@bowtie.com', password="123Az*bbbbb")
        self.user_to_share_with = get_user_model().objects.create_user(email=self.email_to_share_with, password="123Az"
                                                                                                                "*bbbbb")
        self.client.force_authenticate(user=self.test_user)
        diagramStat = DiagramStat.objects.create()
        self.test_xml = ""
        with open(MEDIA_ROOT + "/diagrams/test.xml", "r") as xml:
            for line in xml:
                self.test_xml += line.replace("\t", "").replace("\n", "")
        self.svg_preview = ""
        with open(MEDIA_ROOT + "/diagrams/test.svg", "r") as svg:
            for line in svg:
                self.svg_preview += line
        # xml_string = """<mxGraphModel dx="1426" dy="783" grid="1" gridSize="10" guides="1" tooltips="0" connect="1"
        # arrows="1" fold="1" page="1"
        #       pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff"><root><mxCell id="0"/><mxCell id="1"
        #       parent="0"/><mxCell id="16" value="Pressure of water"
        #                 style="shape=mxgraph.bowtie.hazard;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed" vertex="1"
        #                 customID="Hazard" parent="1"><mxGeometry x="592" y="198" width="120" height="80" as="geometry"/>
        #                 </mxCell><mxCell id="23" value="Hackers get into the system"
        #         style="shape=mxgraph.bowtie.threat;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
        #         customID="Threat" parent="1">
        #     <mxGeometry x="35" y="525" width="120" height="80" as="geometry"/>
        # </mxCell></root></mxGraphModel>"""
        self.diagram_pub1 = Diagram.objects.create(name="test_diagram_pub1", is_public=True,
                                                   diagram=self.test_xml,
                                                   preview=self.svg_preview,
                                                   owner=self.test_user, diagramStat=diagramStat)
        self.diagram_pub2 = Diagram.objects.create(name="test_diagram_pub2", is_public=True,
                                                   diagram=self.test_xml,
                                                   preview=self.svg_preview,
                                                   owner=self.test_user, diagramStat=diagramStat, lastTimeSpent=30)
        self.diagram_private1 = Diagram.objects.create(name="test_diagram_private1", is_public=False,
                                                       diagram=self.test_xml,
                                                       preview=self.svg_preview,
                                                       owner=self.test_user, diagramStat=diagramStat)
        self.GET_DIAGRAM_1_URL = reverse('diagram:my-diagrams', args=(self.diagram_pub1.id,))
        self.PUBLIC_DIAG_URL = reverse('diagram:all-public-diagrams')
        self.ALL_USER_DIAG = reverse('diagram:private-diagrams')
        self.ALL_MY_PRIVATE_DIAGS = reverse('diagram:all-my-private_diagrams')

    def test_get_XML(self):
        """ Test that the GET diagram/{diagram_pub1.id} gives the proper xml"""
        payload = {
            "export_type": "XML"
        }
        res = self.client.get(self.GET_DIAGRAM_1_URL, payload)
        self.assertEqual("application/xml", res["content-type"])
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.test_xml, res.content.decode('utf-8'))

    def test_get_non_existant_diag(self):
        """ Test that the GET diagram/{non-existing-id} doesn't work"""
        # Id chosen bellow (100) is arbitrary
        res = self.client.get(reverse('diagram:my-diagrams', args=(100,)))
        self.assertEqual(404, res.status_code)

    def test_get_all_public(self):
        """ Test that GET diagram/public/list gives all the public diagrams currently stored"""
        res = self.client.get(self.PUBLIC_DIAG_URL)
        self.assertEqual(res.status_code, 200)
        # print(res.content.decode('utf-8'))
        serializer = serializers.DiagramSerializer(data=res.data, many=isinstance(res.data, list))
        serializer.is_valid()
        # print(serializer.errors)
        if serializer.is_valid():
            for diag in serializer.data:
                self.assertIn('pub', diag['name'])
                self.assertEqual(True, diag['is_public'])

    def test_get_all_diags_of_user(self):
        """ Test GET diagram/private gives all the diagrams of the current user"""
        res = self.client.get(self.ALL_USER_DIAG)
        self.assertEqual(res.status_code, 200)
        # print(res.content.decode('utf-8'))
        serializer = serializers.DiagramSerializer(data=res.data, many=isinstance(res.data, list))
        serializer.is_valid()
        # print(serializer.errors)
        diagramCount = 0
        if serializer.is_valid():
            for diag in serializer.data:
                self.assertIn('test', diag['name'])
                # print(diag)
                diagramCount += 1
            # print(f"Number of diagrams stored, expected 3 got {diagramCount}")
            self.assertEqual(3, diagramCount)

    def test_post_new_Diagram_then_Delete(self):
        """ Test POST diagram/private creates a new diagram then test that DELETE diagram/{new_diagram_id} properly
        deletes the diagram """
        res = self.client.post(self.ALL_USER_DIAG, {
            'name': 'test_post',
            'tags': "test, delete",
            'is_public': True,
            'diagram': self.test_xml,
            'lastTimeSpent': 30,
            'preview': self.svg_preview
        })
        self.assertEqual(201, res.status_code)
        diag = Diagram.objects.get(name='test_post')
        self.assertTrue(diag.is_public)
        self.assertEqual(30, diag.lastTimeSpent)
        self.assertEqual(30, diag.diagramStat.totalTimeSpent)
        # We consider the post worked it is now time to delete
        delete_url = reverse('diagram:my-diagrams', args=(diag.id,))
        delete_resp = self.client.delete(delete_url)
        self.assertEqual(204, delete_resp.status_code)
        with self.assertRaises(ObjectDoesNotExist):
            diagToDelete = Diagram.objects.get(name='test_post')

    def test_not_ok_post(self):
        """ Test POST diagram/private but with an unvalid diagram """
        bad_xml = """<mxGeometry x="35" y="525" width="120" height="80" as="geometry"/>"""
        res = self.client.post(self.ALL_USER_DIAG, {
            'name': 'test_post',
            'tags': [''],
            'is_public': True,
            'diagram': bad_xml,
            'lastTimeSpent': 30,
            'preview': self.svg_preview
        })
        self.assertEqual(400, res.status_code)

    def test_put_Update_diagram(self):
        """ Test PUT diagram/{diag_pub2.id} with new diagram updates the correct diagram with new xml and new tags"""
        public_diag_2_url = reverse('diagram:my-diagrams', args=(self.diagram_pub2.id,))

        new_xml_str = """<mxGraphModel dx="1426" dy="783" grid="1" gridSize="10" guides="1" tooltips="0" connect="1" arrows="1" fold="1" page="1"
              pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="16" value="Pressure of water"
                        style="shape=mxgraph.bowtie.hazard;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed" vertex="1"
                        customID="Hazard" parent="1"><mxGeometry x="592" y="198" width="120" height="80" as="geometry"/></mxCell><mxCell id="23" value="Hackers get into the system"
                style="shape=mxgraph.bowtie.threat;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                customID="Threat" parent="1">
            <mxGeometry x="35" y="525" width="120" height="80" as="geometry"/>
        </mxCell><mxCell id="25" value="Destruction of the local infrastructure"
                style="shape=mxgraph.bowtie.consequence;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                customID="Consequence" parent="1">
            <mxGeometry x="995" y="18" width="120" height="80" as="geometry"/>
        </mxCell></root></mxGraphModel>"""
        new_xml = new_xml_str.replace("\t", "").replace("\n", "")
        payload = {
            'diagram': new_xml,
            'is_public': True,
            'name': 'new_pub_diag2',
            'lastTimeSpent': 20,
            'tags': ["test", "to_delete"],
            'preview': self.svg_preview
        }
        res = self.client.put(public_diag_2_url, payload)
        self.assertEqual(201, res.status_code)
        stored_diag = Diagram.objects.get(name='new_pub_diag2')
        self.assertEqual(1, stored_diag.diagramStat.consequences)
        self.assertEqual(20, stored_diag.lastTimeSpent)
        self.assertEqual(50, stored_diag.diagramStat.totalTimeSpent)

    def test_put_malveillant_xml(self):
        """ Test PUT diagram/{diag_pub2.id} but with injected xml, checks that sanitazation is working """
        public_diag_2_url = reverse('diagram:my-diagrams', args=(self.diagram_pub2.id,))
        malveillant_xml = """<mxGraphModel dx="1426" dy="783" grid="1" gridSize="10" guides="1" tooltips="0" connect="1" arrows="1" fold="1" page="1"
                      pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="16" value="Pressure of water"
                                style="shape=mxgraph.bowtie.hazard;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed" vertex="1"
                                customID="Hazard" parent="1"><mxGeometry x="592" y="198" width="120" height="80" as="geometry"/></mxCell><mxCell id="23" value="Hackers get into the system"
                        style="shape=mxgraph.bowtie.threat;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                        customID="Threat" parent="1">
                    <mxGeometry x="35" y="525" width="120" height="80" as="geometry"/>
                </mxCell><mxCell id="25" value="Destruction of the local infrastructure"
                        style="shape=mxgraph.bowtie.consequence;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                        customID="Consequence" parent="1">
                    <mxGeometry x="995" y="18" width="120" height="80" as="geometry"/>
                </mxCell><script>console.log(document.cookies)</script></root></mxGraphModel>"""
        new_xml = malveillant_xml.replace("\t", "").replace("\n", "")
        payload = {
            'diagram': new_xml,
            'is_public': True,
            'name': 'new_pub_diag2',
            'lastTimeSpent': 20,
            'tags': ["malveillant"],
            'preview': self.svg_preview
        }
        res = self.client.put(public_diag_2_url, payload)
        self.assertEqual(201, res.status_code)
        stored_diag = Diagram.objects.get(name='new_pub_diag2')
        self.assertNotIn("<script>", stored_diag.diagram)
        self.assertNotIn("document.cookies", stored_diag.diagram)

    def test_put_without_rights(self):
        """ Test PUT diagram/{diag_pub2.id} but with the wrong user (no permission) """
        diagram_private1_url = reverse('diagram:my-diagrams', args=(self.diagram_private1.id,))
        new_xml_str = """<mxGraphModel dx="1426" dy="783" grid="1" gridSize="10" guides="1" tooltips="0" connect="1" arrows="1" fold="1" page="1"
                      pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="16" value="Pressure of water"
                                style="shape=mxgraph.bowtie.hazard;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed" vertex="1"
                                customID="Hazard" parent="1"><mxGeometry x="592" y="198" width="120" height="80" as="geometry"/></mxCell><mxCell id="23" value="Hackers get into the system"
                        style="shape=mxgraph.bowtie.threat;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                        customID="Threat" parent="1">
                    <mxGeometry x="35" y="525" width="120" height="80" as="geometry"/>
                </mxCell><mxCell id="25" value="Destruction of the local infrastructure"
                        style="shape=mxgraph.bowtie.consequence;html=1;whiteSpace=wrap;fontSize=16;aspect=fixed" vertex="1"
                        customID="Consequence" parent="1">
                    <mxGeometry x="995" y="18" width="120" height="80" as="geometry"/>
                </mxCell></root></mxGraphModel>"""
        new_xml = new_xml_str.replace("\t", "").replace("\n", "")
        payload = {
            'diagram': new_xml,
            'is_public': True,
            'name': 'diagram_private1_NEW',
            'lastTimeSpent': 20,
            'tags': ["test", "to_delete"],
            'preview': self.svg_preview
        }
        self.client.force_authenticate(user=self.user_to_share_with)
        self.diagram_private1.reader.add(self.user_to_share_with)
        res = self.client.put(diagram_private1_url, payload)
        self.assertEqual(405, res.status_code)
        self.assertNotEqual("diagram_private1_NEW", self.diagram_private1.name)

    def test_get_all_private_diag(self):
        """ Test GET diagram/private/list gives all the private diagram of current user"""
        res = self.client.get(self.ALL_MY_PRIVATE_DIAGS)
        self.assertEqual(res.status_code, 200)
        # print(res.content.decode('utf-8'))
        serializer = serializers.DiagramSerializer(data=res.data, many=isinstance(res.data, list))
        serializer.is_valid()
        # print(serializer.errors)
        if serializer.is_valid():
            for diag in serializer.data:
                # print(diag)
                self.assertIn('private', diag['name'])
                self.assertEqual(False, diag['is_public'])

    def test_share_diagram(self):
        """ Test POST diagram/share/{diagram_pub1.id} shares the diagram_pub1 with the self.email_to_share_with as a
        reader """
        payload = {
            "email": self.email_to_share_with,
            "role": "reader"
        }
        res = self.client.post(reverse('diagram:shared-diagram', args=(self.diagram_pub1.id,)), payload)
        self.assertEqual(res.status_code, 200)
        self.assertIn(self.user_to_share_with, self.diagram_pub1.reader.all())
        self.assertNotIn(self.user_to_share_with, self.diagram_pub1.writer.all())

    def test_get_all_diagrams_shared(self):
        """ Test GET diagram/shared gives all the diagrams shared with the current user """
        self.client.force_authenticate(user=self.user_to_share_with)
        self.diagram_pub1.reader.add(self.user_to_share_with)
        res = self.client.get(reverse('diagram:shared-with-me'))
        self.assertEqual(res.status_code, 200)
        serializer = serializers.DiagramSerializer(data=res.data, many=isinstance(res.data, list))
        serializer.is_valid()
        if serializer.is_valid():
            self.assertIn(self.diagram_pub1.name, serializer.data[0]['name'])
