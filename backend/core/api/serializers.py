from rest_framework import serializers

from .. import models

from user.api import serializers as users_serializers


class MinuteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Minute
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user'] = f'{instance.created_by.first_name} {instance.created_by.last_name}'
        return representation


class RelatedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RelatedDocument
        fields = ['id', 'subject', 'content']


class PreviewCodeSerializer(serializers.ModelSerializer):
    user = users_serializers.UserSerializer()

    class Meta:
        model = models.PreviewCode
        fields = ['code', 'used', 'user']


class DocumentTypeSerializer(serializers.ModelSerializer):
    department = users_serializers.DepartmentSerializer()

    class Meta:
        model = models.DocumentType
        fields = ['id', 'name', 'department']


class DocumentActionSerializer(serializers.ModelSerializer):
    document_type = DocumentTypeSerializer()
    user = users_serializers.UserSerializer()

    class Meta:
        model = models.DocumentAction
        fields = ['id', 'user', 'action', 'document_type']


class StampSerializer(serializers.ModelSerializer):
    user = users_serializers.UserSerializer()

    class Meta:
        model = models.Stamp
        fields = ["id", "user", "stamp", "created_at"]


class SignatureSerializer(serializers.ModelSerializer):
    user = users_serializers.UserSerializer()

    class Meta:
        model = models.Signature
        fields = ["id", "user", "signature", "created_at"]


class DocumentsSerializer(serializers.ModelSerializer):
    minute = serializers.SerializerMethodField()
    related_document = serializers.SerializerMethodField()
    preview_code = serializers.SerializerMethodField()
    document_type = DocumentTypeSerializer()
    created_by = users_serializers.UserSerializer()

    class Meta:
        model = models.Document
        fields = ['id', 'content', 'subject', 'minute',
                  'related_document', 'preview_code', 'ref', 'document_type', "filename", "created_at", "created_by"
                  ]

    def get_related_document(self, obj):
        related_document = obj.relateddocument_set
        serialized_related_document = RelatedDocumentSerializer(
            related_document, many=True)
        return serialized_related_document.data

    def get_minute(self, obj):
        minute = models.Minute.objects.filter(document=obj)
        serialized_data = MinuteSerializer(minute, many=True)
        return serialized_data.data

    def get_preview_code(self, obj):
        code = models.PreviewCode.objects.filter(document=obj)
        serialized_data = PreviewCodeSerializer(code, many=True)
        return serialized_data.data

    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        queryset = queryset.prefetch_related('document_type')
        queryset = queryset.prefetch_related('created_by')
        return queryset


class IncomingSerializer(serializers.ModelSerializer):
    sender = users_serializers.UserSerializer()
    document = DocumentsSerializer()
    related_document = serializers.SerializerMethodField()

    class Meta:
        model = models.Trail
        fields = ['id', 'sender', 'document',
                  'created_at', 'related_document']

    def get_related_document(self, obj):
        related_document = obj.document.relateddocument_set.count()
        return related_document

    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        queryset = queryset.prefetch_related('sender')
        queryset = queryset.prefetch_related('document')
        return queryset


class OutgoingSerializer(serializers.ModelSerializer):
    receiver = users_serializers.UserSerializer()
    document = DocumentsSerializer()
    related_document = serializers.SerializerMethodField()

    class Meta:
        model = models.Trail
        fields = ['id', 'receiver', 'document',
                  'created_at', 'related_document']

    def get_related_document(self, obj):
        related_document = obj.document.relateddocument_set.count()
        return related_document

    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        queryset = queryset.prefetch_related('receiver')
        queryset = queryset.prefetch_related('document')
        return queryset


class TrailSerializer(serializers.ModelSerializer):
    sender = users_serializers.UserSerializer()
    receiver = users_serializers.UserSerializer()
    document = DocumentsSerializer(required=False)
    related_document = serializers.SerializerMethodField()

    class Meta:
        model = models.Trail
        fields = ['sender', 'receiver', 'document',
                  'related_document', ]

    def get_related_document(self, obj):
        related_document = obj.document.relateddocument_set
        serialized_related_document = RelatedDocumentSerializer(
            related_document, many=True)
        return serialized_related_document.data


class ArchiveSerializer(serializers.ModelSerializer):
    created_by = users_serializers.UserSerializer()
    closed_by = users_serializers.UserSerializer()
    document = DocumentsSerializer(required=False)

    class Meta:
        model = models.Archive
        fields = ['created_by', 'closed_by', 'document']


class RequestDocumentSerializer(serializers.ModelSerializer):
    requested_by = users_serializers.UserSerializer()
    requested_from = users_serializers.UserSerializer()
    document = DocumentsSerializer()

    class Meta:
        model = models.RequestDocument
        fields = ['id', 'requested_by', 'requested_from',
                  'document', 'active', 'created_at']


class ActivateDocumentSerializer(serializers.ModelSerializer):
    document = DocumentsSerializer()
    receiver = users_serializers.UserSerializer()
    sender = users_serializers.UserSerializer()

    class Meta:
        model = models.ActivateDocument
        fields = ['id', 'document', 'expire_at', 'receiver',
                  'sender', 'date_activated', 'expired', 'created_at', 'read']

    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        queryset = queryset.prefetch_related('receiver')
        queryset = queryset.prefetch_related('sender')
        queryset = queryset.prefetch_related('document')
        return queryset


class CountSerializer(serializers.Serializer):
    count = serializers.IntegerField()


class TrackingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    department = serializers.CharField(max_length=30)
    date = serializers.DateTimeField()


class FlowSerializer(serializers.ModelSerializer):
    document_action = serializers.SerializerMethodField()

    class Meta:
        model = models.DocumentType
        fields = ["id", "name", "document_action"]

    def get_document_action(self, obj):
        document_action = obj.documentaction_set
        serialized_document_action = DocumentActionSerializer(
            document_action, many=True)
        return serialized_document_action.data


class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class FolderSerializer(serializers.ModelSerializer):
    children = RecursiveField(many=True, required=False)
    documents = serializers.SerializerMethodField()

    class Meta:
        model = models.Folder
        fields = ('id', 'name', "slug", "documents",
                  'children', 'created_at')

    def get_documents(self, obj):

        archive_documents = obj.archive_folder.all()
        serialized_document = ArchiveSerializer(archive_documents, many=True)

        return serialized_document.data


class CarbonCopyMinuteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CarbonCopyMinute
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user'] = f'{instance.created_by.first_name} {instance.created_by.last_name}'
        return representation


class CarbonCopyDocument(serializers.ModelSerializer):
    related_document = serializers.SerializerMethodField()
    created_by = users_serializers.UserSerializer()
    document_type = DocumentTypeSerializer()
    minute = serializers.SerializerMethodField()

    class Meta:
        model = models.CarbonCopyDocument
        fields = ['id', 'content',
                  "subject",
                  "filename",
                  "ref",
                  "created_by",
                  "document_type", "related_document", "minute"]

    def get_related_document(self, obj):
        related_document = obj.carboncopyrelateddocument_set
        serialized_related_document = CarbonCopyRelatedDocument(
            related_document, many=True)
        return serialized_related_document.data

    def get_minute(self, obj):
        minute = models.CarbonCopyMinute.objects.filter(
            carbon_copy_document=obj)
        serialized_data = CarbonCopyMinuteSerializer(minute, many=True)
        return serialized_data.data


class CarbonCopyRelatedDocument(serializers.ModelSerializer):
    class Meta:
        model = models.CarbonCopyRelatedDocument
        fields = ["subject",
                  "content",
                  "id"]


class DocumentCopySerializer(serializers.ModelSerializer):
    document = CarbonCopyDocument()
    sender = users_serializers.UserSerializer()

    class Meta:
        model = models.DocumentCopy
        fields = ['id', 'sender', 'document',
                  'created_at']

    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        queryset = queryset.prefetch_related('sender')
        queryset = queryset.prefetch_related('document')
        return queryset


class ArchiveCopySerializer(serializers.ModelSerializer):
    created_by = users_serializers.UserSerializer()
    closed_by = users_serializers.UserSerializer()
    document = CarbonCopyDocument(required=False)

    class Meta:
        model = models.Archive
        fields = ['created_by', 'closed_by', 'document']


class ReferenceSerializer(serializers.ModelSerializer):
    document_type = DocumentTypeSerializer(many=True)

    class Meta:
        model = models.Reference
        fields = ['id', 'name', 'document_type']


class DocumentSearchSerializer(serializers.ModelSerializer):
    document = DocumentsSerializer(read_only=True)

    class Meta:
        model = models.Trail
        fields = ['id', 'document']


class OutgoingDocumentSearchSerializer(DocumentSearchSerializer):

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['route'] = "outgoing"
        return representation


class IncomingDocumentSearchSerializer(DocumentSearchSerializer):

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['route'] = "incoming"
        return representation


class RequestDocumentSearchSerializer(DocumentSearchSerializer):

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['route'] = "pending"
        return representation


class ActivateDocumentSearchSerializer(DocumentSearchSerializer):

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['route'] = "activated"
        return representation


class ArchiveDocumentSearchSerializer(DocumentSearchSerializer):

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['route'] = "archive"
        representation['department'] = instance.created_by.department.name
        return representation
