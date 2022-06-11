from email import message
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from core.models import Trail


class NotificationConsumer(AsyncWebsocketConsumer):
    groups = ["general"]

    async def connect(self):
        await self.accept()
        if self.scope["user"] is not AnonymousUser:
            self.user_id = self.scope["user"].staff_id
            await self.channel_layer.group_add(f"{self.user_id}", self.channel_name)

    async def send_info_to_user_group(self, event):
        message = event["text"]
        await self.send(text_data=json.dumps(message))

    async def send_notification(self, event):
        last_msg = await self.get_message(self.user_id)
        last_msg["status"] = event["text"]
        await self.send(text_data=json.dumps(last_msg))

    async def send_activated_document_notification(self, event):
        last_msg = await self.get_activated_document_message(self.user_id)
        last_msg["status"] = event["text"]
        await self.send(text_data=json.dumps(last_msg))

    async def send_mark_complete_signal(self, event):
        last_msg = await self.get_mark_complete_message(self.user_id)
        last_msg["status"] = event["text"]
        await self.send(text_data=json.dumps(last_msg))

    async def send_add_signature_signal(self, event):
        last_msg = await self.get_add_signature_message(self.user_id)
        last_msg["status"] = event["text"]
        await self.send(text_data=json.dumps(last_msg))

    @database_sync_to_async
    def get_message(self, user_id):
        message = {
            "message": "You have a recieved a new document",
        }

        return message

    @database_sync_to_async
    def get_activated_document_message(self, user_id):
        message = {
            "message": "Activated Document",
        }

        return message

    @database_sync_to_async
    def get_mark_complete_message(self, user_id):
        message = {
            "message": "Document has been marked as complete and Archived",
        }

    @database_sync_to_async
    def get_add_signature_message(self, user_id):
        message = {
            "message": "Document has been marked as complete and Archived",
        }

        return message
