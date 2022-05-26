import os
import random
import json
import uuid
from django.db import models
from django.dispatch import receiver
from django.forms import ValidationError
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext as _
from django.contrib.auth.hashers import make_password
from mptt.models import MPTTModel, TreeForeignKey, TreeManager
from django_celery_beat.models import PeriodicTask, CrontabSchedule
from django.conf import settings


from user import models as users_model


User = get_user_model()


class DocumentAction(models.Model):
    ACTION_OPTIONS = (
        ('F', 'Forward'),
        ('CC', 'Carbon Copy')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=2, choices=ACTION_OPTIONS)
    document_type = models.ForeignKey(
        'DocumentType', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - {self.action}'


class DocumentType(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(
        users_model.Department, on_delete=models.CASCADE, related_name='flow_department', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.department:
            return f'{self.name} [{self.department.name}]'
        return f'{self.name}'


class DocumentBase(models.Model):
    subject = models.CharField(max_length=100)
    filename = models.CharField(max_length=100)
    ref = models.CharField(max_length=60, blank=True, null=True, unique=True)

    document_type = models.ForeignKey(
        DocumentType, on_delete=models.CASCADE, null=True, blank=True)
    folder = models.ForeignKey(
        "Folder", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    signature = models.ManyToManyField("Signature", blank=True)
    stamp = models.ManyToManyField("Stamp", blank=True)

    class Meta:
        abstract = True


class DocumentFile(models.Model):
    doc_file = models.FileField(upload_to='documents/', blank=True, null=True)
    current = models.BooleanField(default=True)
    document = models.ForeignKey(
        "Document", on_delete=models.CASCADE, related_name='document_file', blank=True, null=True)

    def __str__(self):
        return self.document.subject

    def save(self, *args, **kwargs):

        if self.doc_file:
            filename = self.doc_file.name
            check = (".pdf", ".docx", ".doc", ".xls", ".xlsx",
                     ".ppt", ".pptx", ".txt", ".jpeg", ".jpg")
            if not filename.endswith(check):
                raise ValidationError("Unsupported File format")
        else:
            self.document.filename = self.subject

        super(DocumentFile, self).save(*args, **kwargs)


class Document(DocumentBase):
    # content = models.FileField(upload_to='documents/', blank=True, null=True)
    encrypt = models.BooleanField(default=False)
    password = models.CharField(max_length=100, null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='document_creator')

    def __str__(self):
        return self.subject

    def save(self, *args, **kwargs):
        if len(self.subject.strip()) == 0:
            raise ValidationError("Subject cannot be blank")
        if len(self.ref.strip()) == 0:
            raise ValidationError("Reference cannot be blank")

        self.subject = self.subject.strip()
        self.ref = self.ref.strip()

        super(Document, self).save(*args, **kwargs)

    def check_password(self, user_pass):
        hash_user_pass = make_password(user_pass, salt=settings.SALT)
        if len(self.password) > 0:
            if hash_user_pass != self.password:
                raise ValidationError("Incorrect Password")
            return True


class RelatedDocument(models.Model):
    subject = models.CharField(max_length=100)
    content = models.FileField(upload_to='related_documents/')
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject

    def save(self, *args, **kwargs):
        if len(self.subject.strip()) == 0:
            raise ValidationError("Subject cannot be blank")

        if self.content:
            filename = self.content.name
            check = (".pdf", ".docx", ".doc", ".xls", ".xlsx",
                     ".ppt", ".pptx", ".txt", ".jpeg", ".jpg")
            if not filename.endswith(check):
                raise ValidationError("Unsupported File format")

        self.document.related_document = True
        self.subject = self.subject.strip()
        super(RelatedDocument, self).save(*args, **kwargs)


class Minute(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.content


class Trail(models.Model):
    STATUS_OPTIONS = (
        ('P', 'Pending'),
        ('C', 'Completed')
    )

    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='receiver')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=1, choices=STATUS_OPTIONS, default='P')
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    send_id = models.CharField(max_length=50)
    forwarded = models.BooleanField(default=False)
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at', 'status')

    def __str__(self):
        return f'{self.sender} ==> {self.receiver}'


class PreviewCode(models.Model):
    code = models.CharField(max_length=4)
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='document_code')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='employee_code')
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.document.subject} - {self.code}'

    class Meta:
        ordering = ('-created_at',)


class Archive(models.Model):
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_by_employee')
    closed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='closed_by_employee', null=True, blank=True)
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='archive_document')
    close_date = models.DateTimeField(auto_now_add=True)
    requested = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    folder = models.ForeignKey(
        "Folder", on_delete=models.SET_NULL, null=True, blank=True, related_name="archive_folder")

    def __str__(self):
        return self.document.subject


class CarbonCopyArchive(models.Model):
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='carbon_copy_created_by_employee')
    closed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='carbon_copy_closed_by_employee', null=True, blank=True)
    document = models.ForeignKey(
        "CarbonCopyDocument", on_delete=models.CASCADE, related_name='carbon_copy_archive_document')
    close_date = models.DateTimeField(auto_now_add=True)
    requested = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    folder = models.ForeignKey(
        "Folder", on_delete=models.SET_NULL, null=True, blank=True, related_name="carbon_copy_archive_folder")

    def __str__(self):
        return self.document.subject


class RequestDocument(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='request_creator')
    requested_from = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='request_receiver')
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.document.subject}'


class ActivateDocument(models.Model):
    document_receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='activate_document_sender')
    document_sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='activate_document_receiver')
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    date_activated = models.DateTimeField(auto_now_add=True)
    expire_at = models.DateTimeField()
    expired = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.document.subject} - {self.expire_at}'


class FolderManager(TreeManager):
    def viewable(self, user):
        queryset = self.get_queryset().filter(created_by=user, level=0)
        return queryset

    def children(self, slug):
        queryset = self.get_queryset().filter(slug=slug, level__lte=50)
        return queryset


class Folder(MPTTModel):
    name = models.CharField(max_length=60)
    parent = TreeForeignKey('self', on_delete=models.CASCADE,
                            null=True, blank=True, related_name='children')
    slug = models.SlugField()
    objects = FolderManager()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    password = models.CharField(max_length=100, null=True, blank=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if len(self.name.strip()) == 0:
            raise ValidationError("Name cannot be blank")

        unique_id = uuid.uuid4()
        if not self.slug:
            self.slug = slugify(unique_id)

        return super().save(*args, **kwargs)

    def check_password(self, user_pass):
        hash_user_pass = make_password(user_pass, salt=settings.SALT)
        if len(self.password) > 0:
            if hash_user_pass != self.password:
                raise ValidationError("Incorrect Password")
            return True


class DocumentCopyReceiver(models.Model):
    group = models.ManyToManyField(users_model.UserGroup,
                                   related_name='group_receiver', blank=True)
    user = models.ManyToManyField(users_model.User,
                                  related_name='user_receiver', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     if len(self.user.all()) > 0:
    #         return "\n".join([f'{u.first_name} {u.last_name}' for u in self.user.all()[:3]])
    #     elif len(self.group.all()) > 0:
    #         return "\n".join([g.name for g in self.group.all()[:3]])

    def user_receivers(self):
        if len(self.user.all()) > 0:
            return ",\n".join([f'{u.first_name} {u.last_name}' for u in self.user.all()[:3]])
        return None

    def group_receivers(self):
        if len(self.group.all()) > 0:
            return "\n".join([g.name for g in self.group.all()[:3]])
        return None


class DocumentCopy(models.Model):
    STATUS_OPTIONS = (
        ('P', 'Pending'),
        ('C', 'Completed')
    )

    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='carboncopy_sender')
    document = models.ForeignKey(
        "CarbonCopyDocument", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='carboncopy_receiver')
    status = models.CharField(
        max_length=1, choices=STATUS_OPTIONS, default='P')
    send_id = models.CharField(max_length=50)
    forwarded = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.document.subject}'


class CarbonCopyDocument(DocumentBase):
    content = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='document_copy_creator')

    def __str__(self):
        return self.subject


class CarbonCopyMinute(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    carbon_copy_document = models.ForeignKey(
        CarbonCopyDocument, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.content


class CarbonCopyRelatedDocument(models.Model):
    subject = models.CharField(max_length=100)
    content = models.CharField(max_length=200)
    carbon_copy_document = models.ForeignKey(
        CarbonCopyDocument, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.carbon_copy_document.related_document = True
        super(RelatedDocument, self).save(*args, **kwargs)

    def __str__(self):
        return self.subject


class Signature(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    signature = models.FileField(
        upload_to='signature/', null=True, blank=True)
    # document = models.ForeignKey(
    #     Document, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.first_name


class Stamp(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    stamp = models.FileField(upload_to='stamps/', null=True, blank=True)
    # document = models.ForeignKey(
    #     Document, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.first_name


class Reference(models.Model):
    name = models.CharField(max_length=50)
    document_type = models.ManyToManyField(
        DocumentType, related_name="reference_document_type")
    last_increment = models.IntegerField(default=0, blank=True, null=True)

    def __str__(self):
        return self.name


@receiver(post_save, sender=ActivateDocument)
def expire_date_handler(sender, instance, created, **kwargs):
    secret_id = random.randint(1, 9999)
    if created:
        schedule, created = CrontabSchedule.objects.get_or_create(
            minute=0, hour=0,
            day_of_month=instance.expire_at.day, month_of_year=instance.expire_at.month)

        task = PeriodicTask.objects.create(crontab=schedule, name='document_'+str(
            secret_id), task='core.tasks.expire_document', args=json.dumps((instance.id,)))


# @receiver(models.signals.pre_save, sender=DocumentFile)
# def auto_delete_file_on_change(sender, instance, **kwargs):
#     """
#     Deletes old file from filesystem
#     when corresponding `MediaFile` object is updated
#     with new file.
#     """
#     if not instance.pk:
#         return False

#     try:
#         old_file = DocumentFile.objects.get(pk=instance.pk).doc_file
#     except DocumentFile.DoesNotExist:
#         return False

#     new_file = instance.doc_file
#     if not old_file == new_file:
#         if os.path.isfile(old_file.path):
#             os.remove(old_file.path)
