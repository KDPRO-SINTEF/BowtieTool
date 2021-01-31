from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, \
    PermissionsMixin
from django.conf import settings
from taggit.managers import TaggableManager
import reversion
from xml.dom import minidom


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, first_name="",
                    last_name="", **extra_fields):
        """creates and saves new user"""
        if not email:
            raise ValueError('User email is required')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password, first_name="", last_name=""):
        """creates and saves new super user"""
        user = self.create_user(email, password, first_name, last_name)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    """custom user model that supports email instead of username"""
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255)
    is_Researcher = models.BooleanField(default=False)

    # is_active and is_staff are still there since they are used by the django/contrib/auth/admin.py
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UserManager()

    USERNAME_FIELD = 'email'


class DiagramStat(models.Model):
    threats = models.IntegerField(default=0)
    consequences = models.IntegerField(default=0)
    barriers = models.IntegerField(default=0)
    causes = models.IntegerField(default=0)
    totalTimeSpent = models.FloatField(default=0) # total time in minutes passed on this diagram

    def __str__(self):
        res = "threats: " + str(self.threats) + "\nconsequences: " + \
              str(self.consequences) + "\nbarriers: " + str(self.barriers) + "\ncauses: " + str(self.causes) + \
              "\ntime_Spent: " + str(self.totalTimeSpent)
        return res


@reversion.register()
class Diagram(models.Model):
    """Diagram created by user"""
    diagram = models.TextField(default="")
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        to_field='id',
        on_delete=models.CASCADE
    )

    is_public = models.BooleanField(default=False)
    reader = models.ManyToManyField(User, related_name="readers")
    writer = models.ManyToManyField(User, related_name="writers")
    tags = TaggableManager()
    description = models.TextField(default="")
    lastTimeSpent = models.FloatField(default=0) # time in minutes between the last two updates

    diagramStat = models.ForeignKey(DiagramStat,
                                    on_delete=models.CASCADE)

    def get_tags(self):
        # TODO Fix tags (try running post test and see the query results)
        print(self.tags.names())
        return self.tags.names()

    def save(self, *args, **kwargs):

        if self.diagram == "":
            # If the diagram is empty raise error
            self.diagramStat = DiagramStat.objects.create()
            print("Content of diagram is empty (printed from models.py)")
        else:
            # Each time we save a new diagram we will parse the xml to update the diagramStat
            diagram_xml = minidom.parseString(self.diagram)
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
                    self.description += node.getAttribute('value') + ", "
                if node.getAttribute('customID') == "Event":
                    self.description += node.getAttribute('value') + ", "
            new_total_time_spent = self.lastTimeSpent
            # Check that the diagramStat existed before saving (hence adding it's previous value)
            if self.id: # self.id==None only if it's a new instances of Diagram (hence diagramStat is None too)
                new_total_time_spent += float(self.diagramStat.totalTimeSpent)
            self.diagramStat = DiagramStat.objects.create(consequences=consequences, threats=threats,
                                                          barriers=barriers, causes=causes,
                                                          totalTimeSpent=new_total_time_spent)
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def __str__(self):
        return self.name
