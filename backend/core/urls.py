from django.urls import path
from rest_framework import routers

from backend.core.models import Reference

from .api import views

app_name = "core"

urlpatterns = [

    path('incoming/', views.IncomingAPIView.as_view(),
         name='incoming'),
    path('incoming/<document_id>/', views.IncomingAPIView.as_view(),
         name='incoming_document'),
    path('incoming-count/', views.IncomingCountAPIView.as_view(),
         name='incoming-count'),

    path('outgoing-count/', views.OutgoingCountAPIView.as_view(),
         name='outgoing-count'),
    path('outgoing/', views.OutgoingAPIView.as_view(),
         name='outgoing'),

    path('document/<int:id>/', views.DocumentAPIView.as_view(), name='document'),
    path('document-copy/<int:id>/',
         views.DocumentCopyAPIView.as_view(), name='document_copy'),
    path('minutes/<int:document_id>/',
         views.MinuteAPIView.as_view(), name='minute'),
    path('carbon-copy-minutes/<int:document_id>/',
         views.CarbonCopyMinuteAPIView.as_view(), name='carbon-copy-minute'),

    path('archive/', views.ArchiveAPIView.as_view(),
         name='archive'),
    path('archive-count/', views.ArchiveCountAPIView.as_view(),
         name='archive_count'),
    path('archive/<user_id>/', views.ArchiveAPIView.as_view(),
         name='archive'),

    path('mark-complete/<int:id>/',
         views.MarkCompleteAPIView.as_view(), name='mark_complete'),
    path('carbon-copy-mark-complete/<int:id>/',
         views.CarbonCopyMarkCompleteAPIView.as_view(), name='carbon_copy_mark_complete'),

    path('tracking/<document_id>/',
         views.TrackingAPIView.as_view(), name='tracking'),
    path('preview-code/<user_id>/<document_id>/',
         views.PreviewCodeAPIView.as_view(), name='preview_code'),

    path('document-type/', views.DocumentTypeAPIView.as_view(), name='document_type'),
    path('document-action/',
         views.DocumentActionAPIView.as_view(), name='document-action'),
    path('document-action/<document_type_id>/',
         views.DocumentActionAPIView.as_view(), name='document-action'),

    path('forward-document/', views.ForwardDocumentAPIView.as_view(),
         name='forward-document'),
    path('forward-document/<document_id>/', views.ForwardDocumentAPIView.as_view(),
         name='forward-document'),
    path('forward-document-copy/', views.ForwardCopyDocumentAPIView.as_view(),
         name='forward-document-copy'),

    path('request-document/', views.RequestDocumentAPIView.as_view(),
         name='request_document'),
    path('notifications/', views.NotificationsCountAPIView.as_view(),
         name='notifications'),

    path('activate-document/', views.ActivateDocument.as_view(),
         name='activate_document'),
    path('create-flow/', views.CreateFlow.as_view(),
         name='create-flow'),
    path('search/<term>/', views.SearchAPIView.as_view(), name='search'),
    path('create-document/', views.CreateDocument.as_view(), name='create_document'),

    path('folders/', views.FolderAPIView.as_view(), name='folders'),
    path('folders/<slug>/', views.FolderAPIView.as_view(), name='folders'),

    path('encrypt-folder/<slug>/',
         views.EncryptAPIView.as_view(), name='encrypt_folder'),
    path('encrypt-file/<id>/',
         views.EncryptAPIView.as_view(), name='encrypt_file'),

    path('file/', views.ArchiveFileAPIView.as_view(), name='files'),
    path('rename/', views.RenameAPIView.as_view(), name='rename'),
    path('move/', views.MoveItem.as_view(), name='move'),
    path('parent-folder/<slug>/', views.ParentFolder.as_view(), name='parent_folder'),
    path('copy/', views.DocumentCopy.as_view(), name="copy"),
    path('signature-stamp/<document_id>/', views.SignatureStamp.as_view(),
         name="signature_stamp"),
    path('reference/<id>/', views.Reference.as_view(),
         name="reference")
]
