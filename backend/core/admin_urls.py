from django.urls import path
from django.contrib import admin
from .admin_dashboard import admin_dashboard_view

# Custom admin URLs with enhanced dashboard
admin_urlpatterns = [
    path('dashboard/', admin_dashboard_view, name='admin_dashboard'),
    path('', admin.site.urls),
]

urlpatterns = admin_urlpatterns
