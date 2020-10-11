import os

from django.http import Http404, HttpResponse
from rest_framework import viewsets, mixins, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files import File
from core.models import Diagram, User
from django.conf import settings
from diagram import serializers
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet


class DiagramList(APIView):
    """Manage diagrams in the database"""
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Return diagrams of the current authenticated user only"""
        serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(user=self.request.user), many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    # TODO: make filename safe (handles accents)
    def post(self, request):
        """Create new Diagram"""
        serializer = serializers.DiagramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DiagramDetail(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk):
        queryset = Diagram.objects.all().filter(user=self.request.user)
        try:
            return queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        """Return selected diagram of the authenticated user"""
        diagram = self.get_object(pk)
        serializer = serializers.DiagramSerializer(diagram)

        path = serializer.data['diagram'][1:]

        file = open(path, 'rb')

        response = HttpResponse(File(file), content_type='application/file')

        response['Content-Disposition'] = 'attachment; filename="%s"' % path.split('/')[-1]
        return response


class PublicDiagrams(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Returns all public diagrams"""
        serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(public=True), many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
