from rest_framework import serializers
from core.models import Diagram

import json

# Third party
import six
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers


class TagsField(serializers.Field):
    """ custom field to serialize/deserialize TaggableManager instances.
    """

    def to_representation(self, value):
        """ in drf this method is called to convert a custom datatype into a primitive,
        serializable datatype.

        In this context, value is a plain django queryset containing a list of strings.
        This queryset is obtained thanks to get_tags() method on the Task model.

        Drf is able to serialize a queryset, hence we simply return it without doing nothing.
        """
        return value

    def to_internal_value(self, data):
        """ this method is called to restore a primitive datatype into its internal
        python representation.

        This method should raise a serializers.ValidationError if the data is invalid.
        """
        return data


class DiagramSerializer(serializers.ModelSerializer):
    """Serializer for diagram objects"""
    tags = TagsField(source='get_tags')

    def create(self, validated_data):
        # using "source=get_tags" drf "thinks" get_tags is a real field name, so the
        # return value of to_internal_value() is used a the value of a key called "get_tags" inside validated_data dict.
        # We need to remove it and handle the tags manually.
        tags = validated_data.pop("get_tags")
        instance = super(DiagramSerializer, self).create(validated_data)
        instance.tags.set(tags)
        return instance

    class Meta:
        model = Diagram
        fields = ('id', 'name', 'is_public', 'diagram', 'tags', 'preview', 'description',)
        read_only_fields = ('id', 'description',)