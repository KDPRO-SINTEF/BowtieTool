from rest_framework import serializers
from core.models import Diagram


class DiagramSerializer(serializers.ModelSerializer):
    """Serializer for diagram objects"""


    class Meta:
        model = Diagram
        fields = ('id', 'name', 'public', 'diagram')
        extra_kwargs = {'diagram': {'write_only': True}}
        read_only_fields = ('id',)