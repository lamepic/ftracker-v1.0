import json
from datetime import datetime
from django.db.models import Q
from django.conf import settings
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

from rest_framework import views
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .. import models
from . import serializers
from ..libs import exceptions, utils
from user.api import serializers as user_serializers
from user import models as user_models
from mptt.templatetags.mptt_tags import cache_tree_children


User = get_user_model()


class IncomingAPIView(views.APIView):
    def get(self, request, document_id=None, format=None):
        try:
            if document_id:
                incoming_document = models.Trail.objects.filter(
                    document__id=document_id)[0]
                serialized_data = serializers.IncomingSerializer(
                    incoming_document)
                return Response(serialized_data.data, status=status.HTTP_200_OK)

            user = models.User.objects.get(staff_id=request.user.staff_id)
            incoming = models.Trail.objects.filter(
                forwarded=True,
                receiver=user, status='P')
            document_copy = models.DocumentCopy.objects.filter(
                receiver__staff_id=user.staff_id, forwarded=True, status="P")
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        incoming_serialized_data = serializers.IncomingSerializer(
            incoming, many=True)
        document_copy_serialized_data = serializers.DocumentCopySerializer(
            document_copy,
            many=True)

        data = {"incoming": incoming_serialized_data.data,
                "copy": document_copy_serialized_data.data}

        return Response(data, status=status.HTTP_200_OK)


class IncomingCountAPIView(views.APIView):
    def get(self, request, format=None):
        try:
            user = models.User.objects.get(staff_id=request.user.staff_id)
            incoming = models.Trail.objects.filter(
                forwarded=True,
                receiver=user, status='P')
            document_copy = models.DocumentCopy.objects.filter(
                receiver__staff_id=user.staff_id, forwarded=True, status='P').distinct()
            data = utils.Count(len(incoming) + len(document_copy))
        except Exception as err:
            raise exceptions.ServerError(err.args[0])
        serialized_data = serializers.CountSerializer(data)
        return Response(serialized_data.data, status=status.HTTP_200_OK)


class OutgoingAPIView(views.APIView):
    def get(self, request, format=None):
        try:
            user = models.User.objects.get(staff_id=request.user.staff_id)
            outgoing = models.Trail.objects.filter(
                send_id=user.staff_id,
                sender=user, status='P').order_by('-document__id').distinct('document__id')
            document_copy = models.DocumentCopy.objects.filter(
                send_id=user.staff_id,
                sender=user, forwarded=True, status="P")

            serialized_data = serializers.OutgoingSerializer(
                outgoing, many=True)

            document_copy_serialized_data = serializers.DocumentCopySerializer(
                document_copy, many=True)

        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class OutgoingCountAPIView(views.APIView):
    def get(self, request, format=None):
        try:
            user = models.User.objects.get(staff_id=request.user.staff_id)
            outgoing = models.Trail.objects.filter(
                send_id=user.staff_id,
                sender=user, status='P').order_by('-document__id').distinct('document__id')
            data = utils.Count(len(outgoing))
        except Exception as err:
            raise exceptions.ServerError(err.args[0])
        serialized_data = serializers.CountSerializer(data)
        return Response(serialized_data.data, status=status.HTTP_200_OK)


class ArchiveCountAPIView(views.APIView):
    def get(self, request, format=None):
        try:
            user = models.User.objects.get(staff_id=request.user.staff_id)
            archive = [archive for archive in models.Archive.objects.all().order_by(
                'created_by') if archive.created_by.department == user.department]
            folder_archive = models.Folder.objects.viewable(request.user)
            data = utils.Count(len(archive) + len(folder_archive))
        except Exception as err:
            raise exceptions.ServerError(err.args[0])
        serialized_data = serializers.CountSerializer(data)
        return Response(serialized_data.data, status=status.HTTP_200_OK)


class DocumentAPIView(views.APIView):
    def get(self, request, id, format=None):
        try:
            document = get_object_or_404(models.Document, id=id)
            serialized_data = serializers.DocumentsSerializer(document)
        except Exception as err:
            raise exceptions.DocumentNotFound(err.args[0])

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class DocumentCopyAPIView(views.APIView):
    def get(self, request, id, format=None):
        try:
            document = get_object_or_404(models.CarbonCopyDocument, id=id)
            serialized_data = serializers.CarbonCopyDocument(document)
        except Exception as err:
            raise exceptions.DocumentNotFound(err.args[0])

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class MinuteAPIView(views.APIView):
    def post(self, request, document_id, format=None):
        content = request.data
        try:
            document = get_object_or_404(models.Document, id=document_id)
            creator = get_object_or_404(models.User, id=request.user.id)
            minute = models.Minute.objects.create(
                content=content, created_by=creator, document=document)
            serialized_data = serializers.MinuteSerializer(minute)
        except:
            raise exceptions.MinuteError

        return Response(serialized_data.data, status=status.HTTP_201_CREATED)


class CarbonCopyMinuteAPIView(views.APIView):
    def post(self, request, document_id, format=None):
        content = request.data

        try:
            document = get_object_or_404(
                models.CarbonCopyDocument, id=document_id)
            creator = get_object_or_404(models.User, id=request.user.id)
            minute = models.CarbonCopyMinute.objects.create(
                content=content, created_by=creator, carbon_copy_document=document)
            serialized_data = serializers.CarbonCopyMinuteSerializer(minute)
        except Exception as err:
            raise exceptions.MinuteError

        return Response(serialized_data.data, status=status.HTTP_201_CREATED)


class ArchiveAPIView(views.APIView):
    def get(self, request, user_id=None, format=None):
        # get archive of logged in user[department]
        if user_id:
            try:
                employee = models.User.objects.get(
                    staff_id=user_id)

                if employee.is_department:
                    data = [archive for archive in models.Archive.objects.all().order_by(
                        'created_by') if archive.created_by.department == employee.department and archive.folder == None]
                    serialized_data = serializers.ArchiveSerializer(
                        data, many=True)
                    return Response(serialized_data.data, status=status.HTTP_200_OK)
                else:
                    carbon_copy_archive_data = [archive for archive in models.CarbonCopyArchive.objects.all().order_by(
                        'created_by') if archive.closed_by.department == employee.department and archive.folder == None]
                    serialized_carbon_copy_archive_data = serializers.ArchiveCopySerializer(
                        carbon_copy_archive_data, many=True)
                    return Response(serialized_carbon_copy_archive_data.data, status=status.HTTP_200_OK)
            except Exception as err:
                print(err)
                raise exceptions.DocumentNotFound(err.args[0])

        # get all archives in the database
        archives = models.Archive.objects.all()
        serialized_data = serializers.ArchiveSerializer(archives, many=True)

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class MarkCompleteAPIView(views.APIView):
    def post(self, request, id, format=None):
        try:
            document = models.Document.objects.get(id=id)
            trails = models.Trail.objects.filter(document__id=id)

            for trail in trails:
                trail.status = 'C'
                trail.save()

            completed_documents = models.Trail.objects.filter(
                document__id=id, status='C').order_by('created_at')
            last_trail = completed_documents.last()

            create_archive = models.Archive.objects.create(
                created_by=document.created_by, closed_by=last_trail.receiver, document=document)
        except:
            raise exceptions.DocumentNotFound

        return Response({'message': 'marked as complete'}, status=status.HTTP_200_OK)


class CarbonCopyMarkCompleteAPIView(views.APIView):
    def post(self, request, id, format=None):
        try:
            document = models.CarbonCopyDocument.objects.get(id=id)
            trails = models.DocumentCopy.objects.filter(
                document__id=id, receiver=request.user)

            for trail in trails:
                trail.status = 'C'
                trail.save()

            completed_documents = models.DocumentCopy.objects.filter(
                document__id=id, status='C').order_by('created_at')
            last_trail = completed_documents.last()

            create_archive = models.CarbonCopyArchive.objects.create(
                created_by=document.created_by, closed_by=request.user, document=document)
        except Exception as err:
            print(err)
            raise exceptions.DocumentNotFound

        return Response({'message': 'marked as complete'}, status=status.HTTP_200_OK)


class TrackingAPIView(views.APIView):
    def get(self, request, document_id, format=None):
        trackingStep = []
        try:
            document = get_object_or_404(models.Document, id=document_id)
            trails = models.Trail.objects.filter(document__id=document_id)
            creator = document.created_by
            creator_detail = {
                "name": f'{creator.first_name} {creator.last_name}',
                "department": creator.department.name,
                "date": document.created_at
            }
            creator_data = utils.Tracking(
                creator_detail["name"], creator_detail["department"], creator_detail["date"])
            trackingStep.append(creator_data)

            for i in range(len(trails)-1, -1, -1):
                trail = trails[i]
                other_users_detail = {
                    "name": f'{trail.receiver.first_name} {trail.receiver.last_name}',
                    "department": trail.receiver.department.name,
                    "date": trail.created_at
                }
                data = utils.Tracking(
                    other_users_detail["name"], other_users_detail["department"], other_users_detail["date"])
                trackingStep.append(data)
        except Exception as err:
            raise exceptions.TrackingNotFound

        serialized_data = serializers.TrackingSerializer(
            trackingStep, many=True)
        return Response(serialized_data.data, status=status.HTTP_200_OK)


class PreviewCodeAPIView(views.APIView):
    def post(self, request, user_id, document_id, format=None):
        data = request.data
        user_code = data.get('code')
        try:
            code = models.PreviewCode.objects.filter(
                user__staff_id=user_id, document__id=document_id).first()

            if user_code == code.code:
                code.used = True
                code.save()
        except:
            raise exceptions.PreviewCodeError

        return Response({'message': 'success'}, status=status.HTTP_200_OK)

    def get(self, request, user_id, document_id, format=None):
        try:
            data = models.PreviewCode.objects.filter(
                document__id=document_id, user__staff_id=user_id)
        except:
            raise exceptions.PreviewCodeNotFound

        serialised_data = serializers.PreviewCodeSerializer(data, many=True)
        return Response(serialised_data.data, status=status.HTTP_200_OK)


class DocumentTypeAPIView(views.APIView):
    def get(self, request, format=None):
        try:
            document_types = models.DocumentType.objects.filter(
                Q(department=request.user.department) | Q(department=None))

            serialized_data = serializers.DocumentTypeSerializer(
                document_types, many=True)
        except:
            raise exceptions.NotFound

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class DocumentActionAPIView(views.APIView):
    # TODO: check this view and correct the list index out of range error
    def get(self, request, document_type_id=None, format=None):
        if document_type_id:
            try:
                # get document actions for the requested document type
                document_type = get_object_or_404(
                    models.DocumentType, id=document_type_id)
                document_action = models.DocumentAction.objects.filter(
                    document_type__id=document_type_id)
                if len(document_action) > 0:
                    # check if the last user in the document action is the department account else create a department action
                    document_action_last_user = document_action.last()
                    department_account = models.User.objects.get(
                        department=request.user.department, is_department=True)
                    if document_action_last_user.user != department_account:
                        document_type = document_action[0].document_type
                        models.DocumentAction.objects.create(
                            user=department_account, action='F', document_type=document_type)
                    # Check if the request.user [creator of document] is in the document actions
                    document_sender = [
                        user for user in document_action if user.user == request.user]
                    if len(document_sender) > 0:
                        # if request.user is in the document action send document to next user after request.user
                        document_action_lst = [
                            action for action in models.DocumentAction.objects.filter(
                                document_type__id=document_type_id)]
                        document_action_sender_index = document_action_lst.index(
                            document_sender[0])
                        # check if there is a next user to send to then send
                        if document_action_sender_index + 1 <= len(document_action_lst):
                            document_action_next_receiveing_user = document_action_lst[
                                document_action_sender_index + 1]
                        data = document_action_next_receiveing_user
                        serialized_data = serializers.DocumentActionSerializer(
                            data)
                        return Response(serialized_data.data, status=status.HTTP_200_OK)
                    else:
                        document_action_next_receiveing_user = document_action[0]
                        data = document_action_next_receiveing_user
                        serialized_data = serializers.DocumentActionSerializer(
                            data)
                        return Response(serialized_data.data, status=status.HTTP_200_OK)
                else:
                    data = {"document_type": {
                        "id": document_type_id, "name": "Custom"}}
                    return Response(data, status=status.HTTP_200_OK)
            except Exception as err:
                print(err)
                raise exceptions.BadRequest(
                    "Document type is not applicable to this user")


class ForwardDocumentAPIView(views.APIView):

    def get(self, request, document_id, format=None):
        try:
            document = models.Document.objects.get(id=document_id)
            if document.document_type.name == 'Custom':
                return Response({}, status=status.HTTP_200_OK)

            document_actions = models.DocumentAction.objects.filter(
                document_type=document.document_type)
            document_prev_trail = models.Trail.objects.filter(
                document=document)[0]
            next_receiving_user_index = document_prev_trail.order + 1
            if next_receiving_user_index <= len(document_actions)-1:
                next_receiving_user = document_actions[next_receiving_user_index].user
                serialized_receiver = user_serializers.UserSerializer(
                    next_receiving_user)
                data = {"receiver": serialized_receiver.data,
                        "last_receiver": False}
                return Response(data, status=status.HTTP_200_OK)
            else:
                data = {"receiver": None,
                        "last_receiver": True}
                return Response(data, status=status.HTTP_200_OK)
        except Exception as err:
            raise exceptions.ForwardDocumentError(err.args[0])

    def post(self, request, format=None):
        data = request.data
        try:
            receiver = models.User.objects.get(staff_id=data.get('receiver'))
            sender = models.User.objects.get(staff_id=request.user.staff_id)
            document = models.Document.objects.get(id=data.get('document'))
        except Exception as e:
            raise exceptions.FieldError(e)

        if document.document_type.name.lower() == 'custom':
            try:
                prev_trail = models.Trail.objects.filter(
                    document=document)[0]
                prev_trail.forwarded = False
                prev_trail.save()

                trail = models.Trail.objects.create(
                    receiver=receiver, sender=sender, document=document)
                trail.send_id = sender.staff_id
                trail.forwarded = True
                trail.save()
                utils.send_email(receiver=receiver,
                                 sender=sender, document=document, create_code=document.encrypt)
            except Exception as err:
                raise exceptions.ServerError(err.args[0])
        else:
            try:
                prev_trail = models.Trail.objects.filter(
                    document=document)[0]
                document_actions = models.DocumentAction.objects.filter(
                    document_type=document.document_type)
                prev_trail.forwarded = False
                prev_trail.save()

                # document_action_lst = [action for action in document_actions]

                document_action_receiver_index = prev_trail.order + 1
                trail = models.Trail.objects.create(
                    receiver=receiver, sender=sender, document=document, order=document_action_receiver_index)
                trail.send_id = sender.staff_id
                trail.forwarded = True
                trail.save()
                utils.send_email(receiver=receiver,
                                 sender=sender, document=document, create_code=document.encrypt)
            except Exception as err:
                raise exceptions.ServerError

        return Response({'message': 'Document forwarded'}, status=status.HTTP_201_CREATED)


class ForwardCopyDocumentAPIView(views.APIView):
    def post(self, request, format=None):
        data = request.data
        try:
            receiver = models.User.objects.get(staff_id=data.get('receiver'))
            sender = models.User.objects.get(staff_id=request.user.staff_id)
            document = models.CarbonCopyDocument.objects.get(
                id=data.get('document'))
        except Exception as e:
            raise exceptions.FieldError(e)

        try:
            prev_trail = models.DocumentCopy.objects.filter(
                document=document)[0]
            prev_trail.forwarded = False
            prev_trail.save()

            trail = models.DocumentCopy.objects.create(
                receiver=receiver, sender=sender, document=document)
            trail.send_id = sender.staff_id
            trail.forwarded = True
            trail.save()
            utils.send_email(receiver=receiver,
                             sender=sender, document=document, create_code=False)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response({'message': 'Document forwarded'}, status=status.HTTP_201_CREATED)


class RequestDocumentAPIView(views.APIView):

    def post(self, request, format=None):
        data = request.data

        try:
            document = get_object_or_404(
                models.Document, id=data.get('document_id'))
        except:
            raise exceptions.DocumentNotFound

        try:
            requested_by = models.User.objects.get(
                staff_id=request.user.staff_id)
            archive_document = models.Archive.objects.get(
                document__id=document.id)

            requested_from_user = archive_document.created_by if archive_document.closed_by == None else archive_document.closed_by
            requested_from = User.objects.filter(
                department=requested_from_user.department, is_department=True)[0]

            existing_request = models.RequestDocument.objects.filter(
                document__id=document.id, requested_by=requested_by, active=True)

            sent_document = models.ActivateDocument.objects.filter(
                document__id=document.id, document_receiver=requested_by, expired=False)

            if len(existing_request) > 0:
                return Response({'message': 'You already requested this document'}, status=status.HTTP_200_OK)

            if len(sent_document) > 0:
                return Response({'message': 'Document has been sent to you'}, status=status.HTTP_200_OK)

            create_request = models.RequestDocument.objects.create(
                requested_by=requested_by, document=document, requested_from=requested_from)
        except:
            raise exceptions.ServerError

        return Response({'message': 'Document request sent'}, status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        try:
            employee = models.User.objects.get(
                staff_id=request.user.staff_id)
            active_requests = models.RequestDocument.objects.filter(
                active=True, requested_from=employee)
            serialized_data = serializers.RequestDocumentSerializer(
                active_requests, many=True)
        except Exception as e:
            raise exceptions.ServerError

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class NotificationsCountAPIView(views.APIView):

    def get(self, request, format=None):
        pending_document_requests = models.RequestDocument.objects.filter(
            active=True, requested_from=request.user).count()
        activated_documents = models.ActivateDocument.objects.filter(
            document_receiver=request.user, expired=False).count()

        total = pending_document_requests + activated_documents
        data = utils.Count(total)

        serialized_data = serializers.CountSerializer(data)

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class ActivateDocument(views.APIView):
    def post(self, request, format=None):
        data = request.data

        try:
            document = get_object_or_404(
                models.Document, id=data.get('document_id'))
            receiver = get_object_or_404(
                User, staff_id=data.get('receiver_id'))
            sender = models.User.objects.get(staff_id=request.user.staff_id)
            date = data.get('expire_at')
        except Exception as e:
            raise exceptions.FieldError(e)

        try:
            expire_at = datetime.fromisoformat(date[:-1])

            requested_doc_instance = models.RequestDocument.objects.get(
                id=data['request_id'])

            activate_doc = models.ActivateDocument.objects.create(document=document, expire_at=expire_at, document_receiver=receiver,
                                                                  document_sender=sender)

            utils.send_email(receiver=receiver,
                             sender=sender, document=document, create_code=False)

            if activate_doc:
                requested_doc_instance.active = False
                requested_doc_instance.save()
        except:
            raise exceptions.ServerError

        return Response({'msg': 'Document has been activated and sent'}, status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        try:
            employee = models.User.objects.get(
                staff_id=request.user.staff_id)
            activated_documents = models.ActivateDocument.objects.filter(
                expired=False, document_receiver=employee)
        except:
            raise exceptions.ServerError

        serialized_data = serializers.ActivateDocumentSerializer(
            activated_documents, many=True)

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class CreateFlow(views.APIView):
    def post(self, request, format=None):
        data = request.data

        name = data.get('flowName')
        flow = data.get('users')
        references = data.get('references')

        if len(flow) == 0:
            raise exceptions.FieldError("Flow cannot be empty")

        try:
            document_type = models.DocumentType.objects.create(
                name=name, department=request.user.department)

            for reference in references:
                reference = models.Reference.objects.create(name=reference.get(
                    'reference'), last_increment=reference.get('last_increment'))
                reference.document_type.add(document_type)
                reference.save()

            for action in flow:
                employee = models.User.objects.get(
                    staff_id=action.get('employee'))
                act = action.get('action')
                if act.startswith('f'):
                    document_action = models.DocumentAction.objects.create(
                        user=employee, action='F', document_type=document_type)

                if act.startswith('c'):
                    document_action = models.DocumentAction.objects.create(
                        user=employee, action='CC', document_type=document_type)
        except Exception as err:
            print(err)
            raise exceptions.ServerError(err.args[0])

        return Response(request.data, status=status.HTTP_200_OK)

    def get(self, request, format=None):
        flow = models.DocumentType.objects.filter(
            department=request.user.department)
        serialized_data = serializers.FlowSerializer(flow, many=True)

        return Response(serialized_data.data, status=status.HTTP_200_OK)


class SearchAPIView(views.APIView):
    def get(self, request, term, format=None):
        try:
            documents = []
            active_requested_document = models.RequestDocument.objects.filter(
                requested_by=request.user, active=True)
            active_requested_document_lst = [
                doc.document for doc in active_requested_document]

            # activated documents
            activated_documents = models.ActivateDocument.objects.filter(
                document_receiver=request.user, expired=False)
            activated_document_lst = [
                doc.document for doc in activated_documents]
            for item in activated_documents:
                document_serializer = serializers.DocumentsSerializer(
                    item.document)
                activated_data = {
                    "document": document_serializer.data, "route": "activated"}
                documents.append(activated_data)

            # pending documents
            for item in active_requested_document:
                document_serializer = serializers.DocumentsSerializer(
                    item.document)
                pending_data = {
                    "document": document_serializer.data, "route": "pending"}
                documents.append(pending_data)

            # incoming documents
            incoming = models.Trail.objects.filter(
                forwarded=True,
                receiver=request.user, status='P')
            for item in incoming:
                document_serializer = serializers.DocumentsSerializer(
                    item.document)
                incoming_data = {
                    "document": document_serializer.data, "route": "incoming"}
                documents.append(incoming_data)

            # outgoing documents
            outgoing = models.Trail.objects.filter(
                send_id=request.user.staff_id,
                sender=request.user, status='P').order_by('-document__id').distinct('document__id')
            for item in outgoing:
                document_serializer = serializers.DocumentsSerializer(
                    item.document)
                outgoing_data = {
                    "document": document_serializer.data, "route": "outgoing"}
                documents.append(outgoing_data)

            # created archived documents
            archive = [archive for archive in models.Archive.objects.all()]
            for item in archive:
                if item.document not in active_requested_document_lst and item.document not in activated_document_lst:
                    document_serializer = serializers.DocumentsSerializer(
                        item.document)
                    archive_data = {
                        "document": document_serializer.data,
                        "route": "archive",
                        "department": item.created_by.department.name
                    }
                    documents.append(archive_data)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        data = [doc for doc in documents if term.lower() in doc['document']
                ['subject'].lower() or documents if term.lower() in doc['document']
                ['filename'].lower()]

        return Response(data, status=status.HTTP_200_OK)


class CreateDocument(views.APIView):
    def post(self, request, format=None):
        data = request.data
        data_lst = list(data)  # for attachments

        data_document_type = data.get('documentType')
        document = data.get('document')
        reference = data.get('reference')
        subject = data.get('subject')
        filename = data.get('filename')
        encrypt = json.loads(data.get('encrypt'))
        carbon_copy = data.get('carbonCopy')

        receiver = get_object_or_404(
            models.User, staff_id=data.get("receiver"))
        sender = get_object_or_404(
            models.User, staff_id=self.request.user.staff_id)
        document_type = get_object_or_404(
            models.DocumentType, id=data_document_type)

        try:
            if document:
                document = models.Document.objects.create(
                    content=document, subject=subject, created_by=sender,
                    ref=reference, document_type=document_type, encrypt=encrypt, filename=filename)
            else:
                document = models.Document.objects.create(
                    subject=subject, created_by=sender,
                    ref=reference, document_type=document_type, encrypt=encrypt, filename=filename)

            if carbon_copy:
                carbon_copy = json.loads(carbon_copy)
                user_receiver = models.DocumentCopyReceiver()
                user_receiver.save()
                carbon_copy_document_content = None if document.content == None else document.content.url
                carbon_copy_document = models.CarbonCopyDocument.objects.create(
                    content=carbon_copy_document_content,
                    subject=document.subject,
                    filename=document.filename,
                    ref=document.ref,
                    created_by=document.created_by,
                    document_type=document.document_type,
                )

                for copy in carbon_copy:
                    copy = json.loads(copy)
                    if copy['type'].lower() == "user":
                        user = User.objects.get(staff_id=copy['id'])
                        user_receiver.user.add(user)
                    if copy['type'].lower() == "group":
                        group = user_models.UserGroup.objects.get(
                            id=int(copy['id']))
                        user_receiver.group.add(group)
                user_receiver.save()

                single_users = [
                    user.staff_id for user in user_receiver.user.all()]
                # group_users = [user.staff_id for user in group.members.all() for group in user_receiver.group.all()]
                group_users = []
                for group in user_receiver.group.all():
                    for user in group.members.all():
                        group_users.append(user.staff_id)
                unique_users = list(set(single_users + group_users))

                for staff_id in unique_users:
                    copy_receiver = get_object_or_404(
                        models.User, staff_id=staff_id)

                    document_copy = models.DocumentCopy.objects.create(
                        sender=sender, document=carbon_copy_document, receiver=copy_receiver, forwarded=True, send_id=sender.staff_id)

            if document:
                count = 0
                for item in data_lst:
                    if item == f'attachment_{count}':
                        doc = data[item]
                        if f'attachment_subject_{count}' in data_lst:
                            sub = data[f'attachment_subject_{count}']

                        related_document = models.RelatedDocument.objects.create(
                            subject=sub, content=doc, document=document)
                        # if carbon_copy:
                        #     cabon_copy_related_document = models.CarbonCopyRelatedDocument(
                        #         content=related_document.content.url,
                        #         subject=related_document.subject,
                        #         carbon_copy_document=
                        #         )
                        count += 1

            if document_type.name.lower() == 'custom':
                trail = models.Trail.objects.create(
                    receiver=receiver, sender=sender, document=document)
                trail.forwarded = True
                trail.send_id = sender.staff_id
                trail.save()
                utils.send_email(receiver=receiver,
                                 sender=sender, document=document, create_code=encrypt)
            else:
                document_actions = models.DocumentAction.objects.filter(
                    document_type=document_type)
                document_action_receiver = [
                    path for path in document_actions if path.user == receiver]
                document_action_lst = [action for action in document_actions]

                if len(document_action_receiver) > 0:
                    document_action_receiver_index = document_action_lst.index(
                        document_action_receiver[0])
                    current_trail_position = document_action_receiver_index

                    trail = models.Trail.objects.create(
                        receiver=receiver, sender=sender, document=document, order=current_trail_position)
                    trail.forwarded = True
                    trail.send_id = sender.staff_id
                    trail.save()
                    utils.send_email(receiver=receiver,
                                     sender=sender, document=document, create_code=encrypt)

        except IntegrityError as err:
            raise exceptions.BadRequest(err.args[0])
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response({'message': 'Document sent'}, status=status.HTTP_201_CREATED)


class FolderAPIView(views.APIView):

    def get(self, request, slug=None, format=None):
        try:
            if slug is None:
                tree = cache_tree_children(
                    models.Folder.objects.viewable(request.user))
                serializer = serializers.FolderSerializer(tree, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            tree = cache_tree_children(models.Folder.objects.children(slug))
            serializer = serializers.FolderSerializer(tree, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

    def post(self, request, format=None):
        folder_name = request.data.get("name")
        parent_folder_id = request.data.get("folderId")
        password = request.data.get("password")

        try:
            if password is not None:
                hash_password = make_password(password, salt=settings.SALT)
                new_folder = models.Folder.objects.create(
                    name=folder_name, parent_id=parent_folder_id,
                    created_by=request.user, password=hash_password)
            else:
                new_folder = models.Folder.objects.create(
                    name=folder_name, parent_id=parent_folder_id,
                    created_by=request.user)
            serialized_data = serializers.FolderSerializer(new_folder)
            return Response(serialized_data.data, status=status.HTTP_201_CREATED)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])


class EncryptAPIView(views.APIView):
    def get(self, request, slug=None, id=None, format=None):
        try:
            if slug is not None:
                folder = models.Folder.objects.get(slug=slug)
                if folder.password:
                    data = {"encrypted": True}
                    return Response(data, status=status.HTTP_200_OK)
                else:
                    data = {"encrypted": False}
                    return Response(data, status=status.HTTP_200_OK)
            if id is not None:
                document = models.Document.objects.get(id=id)
                if document.password:
                    data = {"encrypted": True}
                    return Response(data, status=status.HTTP_200_OK)
                else:
                    data = {"encrypted": False}
                    return Response(data, status=status.HTTP_200_OK)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

    def post(self, request, slug=None, id=None, format=None):
        password = request.data.get("password")
        try:
            if slug is not None:
                folder = models.Folder.objects.get(slug=slug)
                if folder.check_password(password):
                    data = {"success": True}
                    return Response(data, status=status.HTTP_200_OK)
            if id is not None:
                document = models.Document.objects.get(id=id)
                if document.check_password(password):
                    data = {"success": True}
                    return Response(data, status=status.HTTP_200_OK)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])


class ArchiveFileAPIView(views.APIView):

    def post(self, request, format=None):
        subject = request.data.get("subject")
        reference = request.data.get("reference")
        file = request.data.get("file")
        parent_folder_id = request.data.get("parentFolderId")
        filename = request.data.get("filename")
        password = request.data.get('password')

        try:
            hash_password = None
            if password is not None:
                hash_password = make_password(password, salt=settings.SALT)

            if parent_folder_id != "undefined":
                parent_folder = models.Folder.objects.get_queryset().filter(
                    id=parent_folder_id)
                document = models.Document.objects.create(
                    subject=subject, ref=reference, content=file,
                    created_by=request.user, filename=filename, password=hash_password)
                archive = models.Archive.objects.create(
                    document=document, folder=parent_folder[0], created_by=request.user)
                serialized_data = serializers.ArchiveSerializer(archive)
                return Response(serialized_data.data, status=status.HTTP_201_CREATED)
            else:
                try:
                    document = models.Document.objects.create(
                        subject=subject, ref=reference, content=file, created_by=request.user, filename=filename, password=hash_password)
                    archive = models.Archive.objects.create(
                        document=document,  created_by=request.user)
                    serialized_data = serializers.ArchiveSerializer(archive)
                    return Response(serialized_data.data, status=status.HTTP_201_CREATED)
                except IntegrityError:
                    raise exceptions.ServerError(
                        "File with reference already exists")
            # archive = models.Archive.objects.create(
            #     document=document, folder=parent_folder[0], created_by=request.user)
            # serialized_data = serializers.ArchiveSerializer(archive)

            # return Response(serialized_data.data, status=status.HTTP_201_CREATED)
        except Exception as err:
            raise exceptions.ServerError(err.args[0])


class RenameAPIView(views.APIView):
    def post(self, request, format=None):
        data = request.data
        name = data.get('name')
        _type = data.get("type")

        try:
            if _type.lower() == 'file':
                _id = data.get('id')
                document = models.Document.objects.get(id=_id)
                document.filename = name
                document.save()

            if _type.lower() == 'folder':
                slug = data.get('id')
                folder = models.Folder.objects.get(slug=slug)
                folder.name = name
                folder.save()

        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response({"message": "Folder Renamed successfully!"}, status=status.HTTP_200_OK)


class MoveItem(views.APIView):
    def post(self, request, format=None):
        data = request.data
        opened_folder_slug = data.get('openedFolder')
        items = data.get('item')
        route = data.get('route')

        try:
            parent_folder = models.Folder.objects.get(slug=opened_folder_slug)
            for item in items:
                if item['type'] == "folder":
                    fol = models.Folder.objects.get(slug=item.get('id'))
                    fol.parent = parent_folder
                    fol.save()
                if item['type'] == "file":
                    if route == "archive":
                        fil = models.Archive.objects.get(
                            document__id=item.get('id'))
                    if route == 'directory':
                        fil = models.Archive.objects.get(
                            document__id=item.get('id'))
                    fil.folder = parent_folder
                    fil.save()

        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response({"message": f"{len(items)} item(s) moved successfully"}, status=status.HTTP_201_CREATED)


class ParentFolder(views.APIView):
    def get(self, request, slug, format=None):
        serialized_data = {}
        try:
            folder = models.Folder.objects.get(slug=slug)
            parent = folder.get_ancestors(ascending=True)
            serialized_data = serializers.FolderSerializer(
                parent[0]) if len(parent) > 0 else []
            serialized_data = serialized_data.data if len(parent) > 0 else []
        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response(serialized_data, status=status.HTTP_200_OK)


class DocumentCopy(views.APIView):
    def get(self, request, format=None):
        try:
            groups = user_models.UserGroup.objects.all()
            serialized_groups = user_serializers.UserGroupSerializer(
                groups, many=True)
            # users = User.objects.exclude(is_staff=True)
            # serialized_users = user_serializers.UserSerializer(users, many=True)
            data = serialized_groups.data
        except Exception as err:
            raise exceptions.ServerError(err.args[0])
        return Response(data, status=status.HTTP_200_OK)


class SignatureStamp(views.APIView):
    def post(self, request, document_id, format=None):
        data = request.data
        type = data.get('type')

        try:
            document = get_object_or_404(models.Document, id=document_id)
            user = get_object_or_404(
                models.User, staff_id=request.user.staff_id)

            if type.lower() == "signature":
                signature = models.Signature.objects.get(user=user)
                document.signature.add(signature)
                document.save()

            if type.lower() == "stamp":
                stamp = models.Stamp.objects.get(user=user)
                document.stamp.add(stamp)
                document.save()

        except Exception as err:
            raise exceptions.ServerError(err.args[0])

        return Response({"message": f"{type.capitalize()} added Successfully"}, status=status.HTTP_200_OK)


class ReferenceAPIView(views.APIView):
    def get(self, request, id, format=None):
        try:
            document_type = get_object_or_404(models.DocumentType, id=id)
            references = models.Reference.objects.filter(
                document_type=document_type)
            serialized_data = serializers.ReferenceSerializer(
                references, many=True)
            return Response(serialized_data.data, status=status.HTTP_200_OK)
        except Exception as err:
            print(err)
            raise exceptions.BadRequest(err.args[0])
