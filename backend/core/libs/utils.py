import random
import string
from .. import models
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context
from datetime import date
from django.conf import settings


def send_email(receiver, sender, document, create_code=False):

    code = None

    if create_code:
        code = generate_code()
        models.PreviewCode.objects.create(
            user=receiver, code=code, document=document)

    subject = 'New Encrypted Document Received'

    htmly = get_template('email/document_token.html')
    plaintext = get_template('email/document_token.txt')
    context = {'code': code, 'sender': sender,
               'document': document, 'receiver': receiver, "year": date.today().year, "web_url": settings.WEB_URL}
    html_content = htmly.render(context)
    text_content = plaintext.render(context)
    msg = EmailMultiAlternatives(
        subject, text_content, sender.email, [receiver.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


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
