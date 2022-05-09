from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import generics, views
from rest_framework import status

from . import serializers
from .. import models

User = get_user_model()


class UserAPIView(generics.RetrieveAPIView):
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


class UsersAPIView(generics.ListAPIView):
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.filter(
        is_admin=False).order_by('is_department', 'first_name')


class DepartmentAPIView(generics.ListAPIView):
    serializer_class = serializers.DepartmentSerializer
    queryset = models.Department.objects.all()


class UserGroupAPIView(generics.ListAPIView):
    serializer_class = serializers.UserGroupSerializer
    queryset = models.UserGroup.objects.all()
