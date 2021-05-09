#  Module docstring
import json
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
from django.core import mail
import defusedxml.minidom
import reversion
from reversion.models import Version
import reversion
from django.utils import timezone
import pytz


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
            no_script_xml = noScriptTagsInXML(diagram_xml)
            try:
                # Checks that the diagram sent is properly built
                diagram = defusedxml.minidom.parseString(no_script_xml)
                root = diagram.documentElement.firstChild
                allMxCell = root.getElementsByTagName('mxCell')
            except (AttributeError, TypeError):
                return Response(status=status.HTTP_400_BAD_REQUEST)
            # Checks against XSS
            with reversion.create_revision():
                serializer.save(owner=request.user, lastTimeSpent=request.data['lastTimeSpent'], diagram=no_script_xml)
                reversion.set_date_created(timezone.now())
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
        diagramModel = Diagram.objects.get(pk=pk)
        # Checks that the current user as the rights to update specified diagram
        serializer = serializers.DiagramSerializer(data=request.data)
        if serializer.is_valid():
            # print(diagramModel.owner.username)
            # print(request.user.username)
            diagram_xml = request.data['diagram']
            no_script_xml = noScriptTagsInXML(diagram_xml)
            try:
                # Checks that the diagram sent is properly built
                diagram = defusedxml.minidom.parseString(no_script_xml)
                root = diagram.documentElement.firstChild
                allMxCell = root.getElementsByTagName('mxCell')
            except (AttributeError, TypeError):
                return Response(status=status.HTTP_400_BAD_REQUEST)
            if diagramModel.owner.email != self.request.user.email:
                if diagramModel.is_public:
                    # If current user isn't the owner of the diagram,
                    # then he can only create a new private diagram from the public one
                    serializer.save(owner=request.user, is_public=False, lastTimeSpent=request.data['lastTimeSpent'],
                                    diagram=no_script_xml)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                if self.request.user not in diagramModel.writer.all():
                    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
            # In bellow case we either are the owner, or we have writer rights over the diagram
            # Hence we can modify it
            with reversion.create_revision():
                diagramModel.lastTimeSpent = float(request.data['lastTimeSpent'])
                diagramModel.name = str(request.data['name'])
                diagramModel.diagram = no_script_xml
                diagramModel.is_public = request.data['is_public']
                if request.data['tags'] != "\"\"":
                    diagramModel.tags.set(request.data['tags'])
                diagramModel.preview = request.data['preview']
                diagramModel.save()
                reversion.set_date_created(timezone.now())

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete selected diagram if it's owned by authenticated user, of it's shared with him. In that last case the
        user only deletes his link to the diagram and not the whole diagram. """
        queryset = Diagram.objects.all().filter(owner=self.request.user)
        try:
            diagram = queryset.get(pk=pk)
            diagram.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Diagram.DoesNotExist:
            # In that case the diagram isn't owned by the current user
            # So it might be public, in that case he cannot delete it
            # It might also be shared with him, in that case he can delete his link to the shared diagram
            shared_diagram = Diagram.objects.get(pk=pk)
            is_shared = False
            if self.request.user in shared_diagram.writer.all():
                is_shared = True
                shared_diagram.writer.remove(self.request.user)
                risk_dict = json.loads(shared_diagram.isRiskComputationShared)
                del risk_dict[self.request.user.email]
                shared_diagram.isRiskComputationShared = json.dumps(risk_dict)
                shared_diagram.save()
            if self.request.user in shared_diagram.reader.all():
                is_shared = True
                shared_diagram.reader.remove(self.request.user)
                if self.request.user.email in shared_diagram.isRiskComputationShared:
                    risk_dict = json.loads(shared_diagram.isRiskComputationShared)
                    del risk_dict[self.request.user.email]
                    shared_diagram.isRiskComputationShared = json.dumps(risk_dict)
                shared_diagram.save()
            if is_shared:
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Http404


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
        """Share a specified diagram (pk) with an other user (identified by its email)"""
        queryset = Diagram.objects.all().filter(owner=self.request.user)
        try:
            shared_diagram = queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        email_to_share_with = request.data['email']
        try:
            user = User.objects.get(email=email_to_share_with)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        role = request.data['role']
        is_risk_shared = request.data['isRiskShared']
        if role == "reader":
            shared_diagram.reader.add(user)
        else:
            shared_diagram.writer.add(user)
        is_risk_shared_dict = json.loads(shared_diagram.isRiskComputationShared)
        is_risk_shared_dict[user.email] = is_risk_shared
        # print(is_risk_shared_dict)
        new_dict_str = json.dumps(is_risk_shared_dict)
        # print(new_dict_str)
        shared_diagram.isRiskComputationShared = new_dict_str
        shared_diagram.save()
        if settings.SHARE_BY_EMAIL_ACTIVATED:
            subject = "Someone shared a BowTie diagram with you"
            message = f"{self.request.user.email} shared his BowTie diagram named: \'{shared_diagram.name}\' with you, " \
                      " and " \
                      f"gave you the role of {role}.\nFeel free to visit BowTie++ website to work on this " \
                      f"diagram!\nSincerly,\nBowtie++ team "
            mail.send_mail(subject, message, "no-reply@Bowtie", [user.email], fail_silently=False)
        return Response(status=status.HTTP_200_OK)

    def get(self, request, pk):
        """Return the list of readers and writers for this diagram"""
        queryset = Diagram.objects.all().filter(owner=self.request.user)
        try:
            shared_diagram = queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            raise Http404
        writers = []
        readers = []
        for user in list(shared_diagram.writer.all()):
            writers.append(user.email)
        for user in list(shared_diagram.reader.all()):
            readers.append(user.email)
        data = {
            'writers': json.dumps(writers),
            'readers': json.dumps(readers)
        }
        return Response(data=data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """Delete the specified user from the specified role on this diagram"""
        queryset = Diagram.objects.all().filter(owner=self.request.user)
        try:
            shared_diagram = queryset.get(pk=pk)
        except Diagram.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        delete_completed = False
        if request.data['role'] == "writer":
            for user in shared_diagram.writer.all():
                if user.email == request.data['email']:
                    shared_diagram.writer.remove(user)
                    delete_completed = True
        else:
            for user in shared_diagram.reader.all():
                if user.email == request.data['email']:
                    shared_diagram.reader.remove(user)
                    delete_completed = True
        if delete_completed:
            risk_dict = json.loads(shared_diagram.isRiskComputationShared)
            del risk_dict[request.data['email']]
            shared_diagram.isRiskComputationShared = json.dumps(risk_dict)
            shared_diagram.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)


class SharedWithMe(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Return all the diagrams shared with current authenticated user"""
        diags_as_reader = Diagram.objects.all().filter(reader__email__contains=self.request.user.email)
        diags_as_writer = Diagram.objects.all().filter(writer__email__contains=self.request.user.email)
        all_diags = diags_as_writer.union(diags_as_reader)
        serializer = serializers.DiagramSerializer(all_diags, many=True)
        resp_datas = serializer.data
        # print(resp_datas)
        for diag_serialized in resp_datas:
            diag = Diagram.objects.get(pk=diag_serialized['id'])
            # print(diag)
            diag_is_risk_shared = diag.isRiskComputationShared
            # print(diag_is_risk_shared)
            is_risk_shared_dict = json.loads(diag_is_risk_shared)
            if is_risk_shared_dict != {}:
                value = is_risk_shared_dict[self.request.user.email]
                diag_serialized['isRiskShared'] = value
        return Response(data=resp_datas, status=status.HTTP_200_OK)


class DiagramVersions(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk, auth_user_only=False):
        """Get diagram instance from Primary key"""
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
        """Return versions of the diagram of the authenticated user"""
        diagram = None
        try:
            possible_diagrams = Diagram.objects.all().filter(
                Q(owner=self.request.user) | Q(is_public=True))
            diagram = possible_diagrams.get(pk=pk)
        except Diagram.DoesNotExist:
            pass
        if diagram is None:
            shared_diags = Diagram.objects.all().filter(
                Q(pk=pk) & (Q(reader__email__contains=self.request.user.email) | Q(
                    writer__email__contains=self.request.user.email)))
            diagram = shared_diags.get(pk=pk)
        versions = Version.objects.get_for_object(diagram)
        diagrams = [{key: versions[i].field_dict[key] for key in ['name', 'diagram', 'preview']}
                    for i in range(len(versions))]
        for i in range(len(diagrams)):
            diagrams[i]['id'] = i
            diagrams[i]['date'] = versions[i].revision.date_created
        response = HttpResponse(json.dumps(diagrams, indent=4, sort_keys=True, default=str),
                                content_type='application/json')
        return response

    def post(self, request, pk):
        """Update diagram"""
        # Checks that the current user as the rights to update specified diagram
        diagram = self.get_object(pk, auth_user_only=True)
        versions = Version.objects.get_for_object(diagram)
        id = int(request.data['id'])
        if id >= len(versions) or id < 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        versions[id].revision.revert()

        return Response(status=status.HTTP_200_OK)
