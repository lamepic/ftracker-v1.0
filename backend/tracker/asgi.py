"""
ASGI config for tracker project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from core.middlewares import TokenAuthMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from core.consumers import NotificationConsumer
from core import routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(
                routing.websocket_urlpatterns
            )
        )
    )
})
