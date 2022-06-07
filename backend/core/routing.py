from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'push-notification/', consumers.NotificationConsumer.as_asgi()),
]
