from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from . import models
from .forms import UserAdminChangeForm, UserAdminCreationForm

User = get_user_model()
USERNAME_FIELD = User.USERNAME_FIELD
REQUIRED_FIELDS = (USERNAME_FIELD,) + tuple(User.REQUIRED_FIELDS)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm
    list_display = ('id', 'first_name', 'last_name', 'email',
                    'staff_id', 'department', 'is_active')
    fieldsets = (
        (None, {"fields": ("staff_id", "password")}),
        (_("Personal info"), {
            "fields": ("first_name", "last_name", "email", "department")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_admin",
                    "is_department",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'staff_id', "first_name", "last_name", "department", 'password1', 'password2'),
        }),)
    readonly_fields = (
        'date_joined',
    )
    search_fields = (USERNAME_FIELD,)
    ordering = (USERNAME_FIELD,)
    list_filter = ()
    filter_horizontal = ()


@admin.register(models.Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name']
