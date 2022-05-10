from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from mptt.admin import DraggableMPTTAdmin


from . import models

User = get_user_model()


@admin.register(models.Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'ref',
                    'filename', 'created_by', 'document_type', "created_at"]

    def filename(self, obj):
        return obj.content.name[10:]


@admin.register(models.RelatedDocument)
class RelatedDocumentAdmin(admin.ModelAdmin):
    list_display = ['subject', 'filename', 'document']

    def filename(self, obj):
        return obj.content.name[18:]

    def document(self, obj):
        return obj.document.name


@admin.register(models.Trail)
class TrailAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'created_at',
                    'document', 'document_type', 'status']
    search_fields = (
        "document__subject",
    )
    list_filter = ('status',)

    def document_type(self, obj):
        return obj.document.document_type


@admin.register(models.Minute)
class MinuteAdmin(admin.ModelAdmin):
    list_display = ['content', 'created_by', 'created_at']


@admin.register(models.PreviewCode)
class PreviewCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'document', 'code', 'used', 'created_at']
    list_filter = ('used',)


@admin.register(models.RequestDocument)
class RequestDocumentAdmin(admin.ModelAdmin):
    list_display = ['requested_by', 'document', 'requested_from', 'created_at']


@admin.register(models.Archive)
class ArchiveAdmin(admin.ModelAdmin):
    list_display = ['created_by', 'closed_by',
                    'document', 'close_date', 'requested']
    search_fields = (
        "document__subject",
    )

    def document(self, obj):
        return obj.document.name


@admin.register(models.CarbonCopyArchive)
class CarbonCopyArchiveAdmin(admin.ModelAdmin):
    list_display = ['created_by', 'closed_by',
                    'document', 'close_date', 'requested']
    search_fields = (
        "document__subject",
    )

    def document(self, obj):
        return obj.document.name


@admin.register(models.ActivateDocument)
class ActivateDocumentAdmin(admin.ModelAdmin):
    list_display = ['document', 'document_receiver',
                    'document_sender', 'expire_at', 'date_activated', 'expired']


@admin.register(models.DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ["id", 'name', 'department']


@admin.register(models.DocumentAction)
class DocumentActionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'document_type']
    list_filter = ['document_type']


@admin.register(models.DocumentCopy)
class DocumentCopy(admin.ModelAdmin):
    list_display = ['sender', 'document',
                    'created_at', 'receiver']


@admin.register(models.DocumentCopyReceiver)
class DocumentCopyReceiver(admin.ModelAdmin):
    list_display = ["id", 'user_receivers', 'group_receivers']


@admin.register(models.Stamp)
class StampAdmin(admin.ModelAdmin):
    list_display = ["user", 'stamp', 'created_at']


@admin.register(models.Signature)
class SignatureAdmin(admin.ModelAdmin):
    list_display = ["user", 'signature', 'created_at']


class CustomMPTTModelAdmin(DraggableMPTTAdmin):
    # specify pixel amount for this ModelAdmin only:
    mptt_level_indent = 20


admin.site.register(models.Folder, CustomMPTTModelAdmin)


@admin.register(models.CarbonCopyDocument)
class CarbonCopyDocumentAdmin(admin.ModelAdmin):
    pass
    # list_display = ['id', 'subject', 'ref',
    #                 'filename', 'created_by', 'document_type', "created_at"]


@admin.register(models.CarbonCopyMinute)
class CarbonCopyMinuteAdmin(admin.ModelAdmin):
    list_display = ['content', 'created_by', 'created_at']


@admin.register(models.CarbonCopyRelatedDocument)
class CarbonCopyRelatedDocumentAdmin(admin.ModelAdmin):
    list_display = ['subject', 'content', 'document']

    def document(self, obj):
        return obj.document.name


@admin.register(models.Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ['name']
