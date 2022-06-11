from __future__ import unicode_literals

from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils.translation import ugettext_lazy as _

from .managers import UserManager


class User(AbstractBaseUser):
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    is_active = models.BooleanField(_('active'), default=True)
    staff_id = models.CharField(
        _('staff ID'), max_length=7, unique=True)
    department = models.ForeignKey(
        'Department', on_delete=models.CASCADE, blank=True, null=True)

    is_admin = models.BooleanField(
        _('superuser status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.')
    )

    is_staff = models.BooleanField(_('is staff'), default=False, help_text=_(
        'Designates whether the user has some previleges'))

    is_department = models.BooleanField(
        _('is department'),
        default=False,
        help_text=_('Designates whether the user is a department account')
    )

    objects = UserManager()

    USERNAME_FIELD = 'staff_id'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        '''
        Returns the first_name plus the last_name, with a space in between.
        '''
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        '''
        Returns the short name for the user.
        '''
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        '''
        Sends an email to this User.
        '''
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


class Department(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.capitalize()
        super(Department, self).save(*args, **kwargs)


class UserGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField(User)

    def __str__(self):
        return self.name
