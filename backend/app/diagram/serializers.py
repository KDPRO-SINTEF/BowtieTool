from rest_framework import serializers
from core.models import Diagram


class DiagramSerializer(serializers.ModelSerializer):
    """Serializer for diagram objects"""


    class Meta:
        model = Diagram
        fields = ('id', 'name', 'public', 'diagram')
        read_only_fields = ('id',)