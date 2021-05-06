import reversion
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, \
    PermissionsMixin
from django.conf import settings
from taggit.managers import TaggableManager
from user.validators import UserNameValidator
from django.core import exceptions
import django.contrib.auth.password_validation as validators
from django.utils import timezone
import defusedxml.minidom
import django.forms
import PIL
from rest_framework.exceptions import ValidationError
import reversion


class UserManager(BaseUserManager):
    """ A manager class for instantiating and updting users
    """

    def create_user(self, email, password, username="", **extra_fields):
        """creates and saves new user"""
        if not (email and password):
            raise ValueError('User email and password is required')
        try:
            validators.validate_password(password=password)
            UserNameValidator().validate(username)
        except exceptions.ValidationError as e_valid:
            raise ValidationError(e_valid)

        user = self.model(email=self.normalize_email(email), password=password, username=username, **extra_fields)
        user.username = username
        user.set_password(password)
        user.save(using=self._db)
        profile = Profile(user=user)
        profile.save(using=self._db)
        user.profile = profile
        return user

    def create_superuser(self, email, password, username=""):
        """creates and saves new super user """

        if not (email and password):
            raise ValueError('User email and password is required')
        try:
            validators.validate_password(password=password)
        except exceptions.ValidationError as e_valid:
            raise ValidationError(e_valid)

        user = self.create_user(email, password, username)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        user.profile.email_confirmed = True
        user.profile.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """custom user model that supports email instead of username"""
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=66)
    is_Researcher = models.BooleanField(default=False)

    # is_active and is_staff are still there since they are used by the django/contrib/auth/admin.py
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.username + " " + self.email


class NonceToToken(models.Model):
    """Model for binding hashesh to user id when sending links containing 
        the information
    """

    uid = models.IntegerField(default=False, unique=True)
    nonce = models.CharField(default=False, unique=True, max_length=128)

    def __str__(self):
        return "NonceToToken model"


class Profile(models.Model):
    """Profile of a user related to authentication features"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    # Authentication attributes
    email_confirmed = models.BooleanField(default=False, unique=False)
    last_login = models.DateTimeField(default=timezone.now, unique=False)
    two_factor_enabled = models.BooleanField(default=False, unique=False)

    def __str__(self):
        return self.user.email + " " + str(self.email_confirmed) + " " + str(self.last_login)


class DiagramStat(models.Model):
    """ Statistical datas linked to a diagram, used by researchers"""
    threats = models.IntegerField(default=0)
    consequences = models.IntegerField(default=0)
    barriers = models.IntegerField(default=0)
    causes = models.IntegerField(default=0)
    assets = models.IntegerField(default=0)
    security_control = models.IntegerField(default=0)
    totalTimeSpent = models.FloatField(default=0)  # total time in minutes passed on this diagram

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
        on_delete=models.CASCADE)

    is_public = models.BooleanField(default=False)
    reader = models.ManyToManyField(User, related_name="readers")
    writer = models.ManyToManyField(User, related_name="writers")
    isRiskComputationShared = models.TextField(default="{}")
    tags = TaggableManager()
    description = models.TextField(default="")
    lastTimeSpent = models.FloatField(default=0)  # time in minutes between the last two updates

    diagramStat = models.ForeignKey(DiagramStat,
                                    on_delete=models.CASCADE)
    preview = models.TextField(default="")
    # preview = models.ImageField(upload_to='diagrams', blank=True, null=True)
    riskTable = models.TextField(default="")

    def get_tags(self):
        return self.tags.names()

    def save(self, *args, **kwargs):
        """ Redefinition of default save method so that it update all field when a new diagram is saved"""
        if self.diagram == "":
            # If the diagram is empty raise error
            self.diagramStat = DiagramStat.objects.create()
            print("Content of diagram is empty (printed from models.py)")
        else:
            # Each time we save a new diagram we will parse the xml to update the diagramStat
            diagram_xml = defusedxml.minidom.parseString(self.diagram)
            root = diagram_xml.documentElement.firstChild
            threats = 0
            causes = 0
            consequences = 0
            barriers = 0
            security_control = 0
            assets = 0
            allMxCell = root.getElementsByTagName('mxCell')
            for node in allMxCell:
                customId = node.getAttribute('customID')
                if customId:
                    self.description += node.getAttribute('value') + ", "
                if customId == "Threat":
                    threats += 1
                if customId == "Consequence":
                    consequences += 1
                if customId == "Cause":
                    causes += 1
                if customId == "Security Control":
                    security_control += 1
                if customId == "Asset":
                    assets += 1
                if customId == "Barrier":
                    barriers += 1
                if customId == "Hazard":
                    pass
                if customId == "Event":
                    pass
            new_total_time_spent = self.lastTimeSpent
            # Check that the diagramStat existed before saving (hence adding it's previous value)
            if self.id:  # self.id==None only if it's a new instances of Diagram (hence diagramStat is None too)
                new_total_time_spent += float(self.diagramStat.totalTimeSpent)
            self.diagramStat = DiagramStat.objects.create(consequences=consequences, threats=threats,
                                                          barriers=barriers, causes=causes,
                                                          security_control=security_control,
                                                          totalTimeSpent=new_total_time_spent,
                                                          assets=assets)
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def __str__(self):
        return self.name
