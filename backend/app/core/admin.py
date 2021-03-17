from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from django.utils.translation import gettext as _
from xml.dom import minidom
from core import models


class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['email', ]
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('username',)}),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_Researcher', 'is_superuser',)}
        )
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')
        }),
    )


class DiagramAdmin(admin.ModelAdmin):
    fields = ['name', 'is_public', 'diagram', 'tags', 'owner', 'reader', 'writer']
    def save_model(self, request, obj, form, change):
        obj.added_by = request.user
        diagram_xml = minidom.parseString(obj.diagram)
        root = diagram_xml.documentElement.firstChild
        threats = 0
        causes = 0
        consequences = 0
        barriers = 0
        allMxCell = root.getElementsByTagName('mxCell')
        for node in allMxCell:
            if node.getAttribute('customID') == "Threat":
                threats += 1
            if node.getAttribute('customID') == "Consequence":
                consequences += 1
            if node.getAttribute('customID') == "Cause":
                causes += 1
            if node.getAttribute('customID') == "Barrier":
                barriers += 1
            if node.getAttribute('customID') == "Hazard":
                obj.description += node.getAttribute('value') + ", "
            if node.getAttribute('customID') == "Event":
                obj.description += node.getAttribute('value') + ", "
        new_total_time_spent = obj.lastTimeSpent
        # Check that the diagramStat existed before saving (hence adding it's previous value)
        if obj.id:  # self.id==None only if it's a new instances of Diagram (hence diagramStat is None too)
            new_total_time_spent += float(obj.diagramStat.totalTimeSpent)
        obj.diagramStat = models.DiagramStat.objects.create(consequences=consequences, threats=threats,
                                                      barriers=barriers, causes=causes,
                                                      totalTimeSpent=new_total_time_spent)
        super(DiagramAdmin, self).save_model(request, obj, form, change)

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Diagram, DiagramAdmin)