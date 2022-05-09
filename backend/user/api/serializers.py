from django.contrib.auth import get_user_model
from rest_framework import serializers

from .. import models

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Department
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer()

    class Meta:
        model = User
        fields = ["staff_id", "first_name", "last_name", 'email',
                  'is_department', 'staff_id', 'department']

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "staff_id"}
        }


class UserGroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True)

    class Meta:
        model = models.UserGroup
        fields = ['id', 'name', 'members']
