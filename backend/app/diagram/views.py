#  Module docstring
import operator
import os
from functools import reduce

from django.http import Http404, HttpResponse
from rest_framework import viewsets, mixins, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from django.core.files import File
from core.models import Diagram, User, DiagramStat
from django.conf import settings
from diagram import serializers
import re
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Min, Sum, F, FloatField, When, Case
import PIL


def noScriptTagsInXML(input_xml):
    pattern = r'<[ ]*script.*?\/[ ]*script[ ]*>'
    no_script_xml = re.sub(pattern, '', input_xml, flags=(re.IGNORECASE | re.MULTILINE | re.DOTALL))
    return no_script_xml


class IsResearcher(BasePermission):
    """
    Allows access only to researchers.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_Researcher)


class DiagramList(APIView):
    """Manage diagrams in the database"""
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Return all diagrams of the current authenticated user only"""
        search = request.GET.get("search")
        if search:
            serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(
                Q(owner=self.request.user) | reduce(operator.and_,
                                                    (Q(description__icontains=x) for x in search.split()))), many=True)
        else:
            serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(owner=self.request.user), many=True)
            # print(serializer.data)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create new Diagram"""
        # request_img = request.data['preview']
        serializer = serializers.DiagramSerializer(data=request.data)
        if serializer.is_valid():
            diagram_xml = request.data['diagram']
            # Checks against XSS
            no_script_xml = noScriptTagsInXML(diagram_xml)
            serializer.save(owner=request.user, lastTimeSpent=request.data['lastTimeSpent'], diagram=no_script_xml)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DiagramDetail(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk, auth_user_only=False):
        """Get diagram object from Primary key"""
        if auth_user_only:
            queryset = Diagram.objects.all().filter(owner=self.request.user)
        else:
            queryset = Diagram.objects.all().filter(Q(owner=self.request.user) | Q(is_public=True))
        try:
            queryset = queryset.get(pk=pk)
            return queryset
        except Diagram.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        """Return selected diagram of the authenticated user"""
        diagram = self.get_object(pk, auth_user_only=True)
        serializer = serializers.DiagramSerializer(diagram)
        export_type = request.GET.get("export_type")
        xml_data = serializer.data['diagram']

        response = HttpResponse(xml_data, content_type='application/xml')

        # response['Content-Disposition'] = 'attachment; filename="%s"' % path.split('/')[-1]
        return response

    def put(self, request, pk):
        """Update diagram"""
        diagramModel = self.get_object(pk)
        # Checks that the current user as the rights to update specified diagram
        if diagramModel.owner != self.request.user or (self.request.user not in diagramModel.writers):
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        serializer = serializers.DiagramSerializer(data=request.data)
        if serializer.is_valid():
            # print(diagramModel.owner.username)
            # print(request.user.username)
            diagram_xml = request.data['diagram']
            no_script_xml = noScriptTagsInXML(diagram_xml)
            if diagramModel.is_public and (diagramModel.owner.username != request.user.username):
                # If current user isn't the owner of the diagram,
                # then he can only create a new private diagram from the public one
                serializer.save(owner=request.user, is_public=False, lastTimeSpent=request.data['lastTimeSpent'],
                                diagram=no_script_xml)
            else:
                diagramModel.lastTimeSpent = float(request.data['lastTimeSpent'])
                diagramModel.name = str(request.data['name'])
                diagramModel.diagram = no_script_xml
                diagramModel.is_public = request.data['is_public']
                diagramModel.tags = request.data['tags']
                diagramModel.preview = request.data['preview']
                diagramModel.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete selected diagram of authenticated user"""
        diagram = self.get_object(pk, auth_user_only=True)
        diagram.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicDiagrams(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Returns all public diagrams"""
        search = request.GET.get("search")
        if search:
            serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(
                Q(is_public=True) | reduce(operator.and_, (Q(description__icontains=x) for x in search.split()))),
                many=True
            )
        else:
            serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(is_public=True), many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)


class PrivateDiagrams(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Returns all private diagrams of a user"""
        serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(Q(is_public=False)
                                                                                & Q(owner=request.user)), many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class StatsView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsResearcher,)

    def get(self, request):
        queryset = DiagramStat.objects.all().annotate(
            cons=F('consequences'),
            sec_con=F('security_control'),
            barriers_per_consequences=Case(
                When(cons=0, then=0),
                default=(F('barriers') / F('consequences')),
                output_field=FloatField(),
            ),
            barriers_per_threats=Case(
                When(sec_con=0, then=0),
                default=(F('security_control') / F('consequences')),
                output_field=FloatField(),
            ),
        )
        resp = queryset.aggregate(Avg('threats'), Avg('consequences'), Avg('barriers'), Avg('causes'),
                                  Avg('totalTimeSpent'),
                                  Avg('barriers_per_consequences'),
                                  Avg('barriers_per_threats'),
                                  Avg('assets'),
                                  )
        resp['count'] = DiagramStat.objects.count()

        return Response(resp)


class ShareView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        queryset = Diagram.objects.all().filter(owner=self.request.user)
        try:
            shared_diagram = queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            raise Http404
        email_to_share_with = request.data['email']
        try:
            user = User.objects.get(email=email_to_share_with)
        except User.DoesNotExist:
            raise Http404
        role = request.data['role']
        if role == "reader":
            shared_diagram.readers.add(user)
        else:
            shared_diagram.writers.add(user)
        # TODO send new email to notify user that a diagram was shared with him

        return Response(status=status.HTTP_200_OK)


    def get(self, request, pk):
        # TODO send all diagrams shared with the current user
        diags_as_reader = Diagram.objects.all().filter(readers__contains=self.request.user)
        diags_as_writer = Diagram.objects.all().filter(writers__contains=self.request.user)
        # if (self.request.user in diag.writers) or (self.request.user in diag.readers):

