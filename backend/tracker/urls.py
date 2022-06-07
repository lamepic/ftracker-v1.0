from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from user.api import views


urlpatterns = [
    path('grappelli/', include('grappelli.urls')),
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),

    path('api/v1/', include('core.urls')),

    path('api/v1/users/', views.UsersAPIView.as_view(), name='users'),
    path('api/v1/departments/', views.DepartmentAPIView.as_view(), name='departments'),
    path('api/v1/groups/', views.UserGroupAPIView.as_view(), name='user_groups'),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATICFILES_DIRS)
