from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, \
    PermissionsMixin
from django.conf import settings


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
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'


class Diagram(models.Model):
    """Diagram created by user"""
    name = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        to_field='id',
        on_delete=models.CASCADE
    )
    public = models.BooleanField(default=False)
    diagram = models.FileField(upload_to='diagrams/')

    def __str__(self):
        return self.name
