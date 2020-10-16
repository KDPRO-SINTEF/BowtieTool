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
from django.db.models import Q

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

    def get_object(self, pk, auth_user_only=False):
        """Get diagram object from Primary key"""
        if auth_user_only:
            queryset = Diagram.objects.all().filter(user=self.request.user)
        else:
            queryset = Diagram.objects.all().filter(Q(user=self.request.user) | Q(public=True))
        try:
            return queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        """Return selected diagram of the authenticated user"""
        diagram = self.get_object(pk, auth_user_only=True)
        serializer = serializers.DiagramSerializer(diagram)

        path = serializer.data['diagram'][1:]

        file = open(path, 'rb')

        response = HttpResponse(File(file), content_type='application/file')

        response['Content-Disposition'] = 'attachment; filename="%s"' % path.split('/')[-1]
        return response

    # TODO: handle case where diagram public , and owner update ( currently duplicates file)
    def put(self, request, pk):
        """Update diagram"""
        diagram = self.get_object(pk)
        serializer = serializers.DiagramSerializer(data=request.data)
        if serializer.is_valid():
            if not diagram.public:
                os.remove(diagram.diagram.path)
                diagram.delete()
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete selected diagram of authenticated user"""
        diagram = self.get_object(pk, auth_user_only=True)
        os.remove(diagram.diagram.path)
        diagram.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicDiagrams(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Returns all public diagrams"""
        serializer = serializers.DiagramSerializer(Diagram.objects.all().filter(public=True), many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)



