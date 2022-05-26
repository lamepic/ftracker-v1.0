import random
import string
from .. import models
from django.core.mail import send_mail


def send_email(receiver, sender, document, create_code=False):

    code = None

    if create_code:
        code = generate_code()
        models.PreviewCode.objects.create(
            user=receiver, code=code, document=document)

    subject = 'New Document Received'

    body = f'''You Just Received a document
            {document.subject.capitalize()} from {sender.first_name} {sender.last_name}.'''

    info = {
        'sender': sender,
        'receiver': receiver
    }

    if code:
        info['code'] = code
        body = f'''You Just Received a document
            {document.subject.capitalize()} from {sender.first_name} {sender.last_name}
            with a one time token to view it. Your one time code is {code}'''

    # html_body = render_to_string('preview_code.html', info)

    send_mail(subject, body, sender.email, [
              receiver.email], fail_silently=False)
    # send_mail(subject, None, sender.user.email, [
    #           receiver.user.email], fail_silently=False, html_message=html_body)


def generate_code():
    code = random.sample(string.digits, 4)
    return ''.join(code)


def coord(x, y, unit=1):
    x, y = x * unit, y * unit
    return x, y


class Count:
    def __init__(self, count):
        self.count = count


class Tracking:
    def __init__(self, name, department, date):
        self.name = name
        self.department = department
        self.date = date
