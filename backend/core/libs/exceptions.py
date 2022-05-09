from rest_framework.exceptions import APIException


# super classes
# -----------------------------------------
class NotFound(APIException):
    status_code = 404
    default_detail = 'Not found.'
    default_code = 'not_found'


class BadRequest(APIException):
    status_code = 400
    default_detail = 'Bad request'
    default_code = 'bad_request'


class ServerError(APIException):
    status_code = 500
    default_detail = 'Server error'
    default_code = 'server_error'

# inherited classes
# ---------------------------------------------


class StaffIDNotFound(NotFound):
    default_detail = 'User with staff ID not found.'
    default_code = 'user_with_staff_id_not_found'


class LoginLimitExceeded(APIException):
    status_code = 423
    default_detail = 'Too many login attempts, your account has been locked. Contact admin.'
    default_code = 'user_with_staff_id_not_found'


class DocumentNotFound(NotFound):
    default_detail = 'Document not found.'
    default_code = 'document_not_found'


class TrackingNotFound(NotFound):
    default_detail = 'Trail for document not found.'
    default_code = 'tracking_not_found'


class MinuteError(BadRequest):
    default_detail = 'Minute not created.'
    default_code = 'minute_create_fail'


class PreviewCodeError(BadRequest):
    default_detail = 'Wrong code.'
    default_code = 'preview_code_error'


class PreviewCodeNotFound(NotFound):
    default_detail = 'Preview code not found.'
    default_code = 'preview_code_not_found'


class EmptyDocumentAction(NotFound):
    default_detail = 'No document actions found. Custom'
    default_code = 'empty document action'


class CustomDocumentType(APIException):
    status_code = 200
    default_detail = 'Custom document'
    default_code = 'custom_document_type'


class ForwardDocumentError(BadRequest):
    default_detail = 'Could not get any data to forward'
    default_code = 'forward_document_error'


class FieldError(APIException):
    status_code = 400
    default_detail = 'Add Field'
    default_code = 'forward_document_error'
