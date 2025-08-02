from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('profile/', views.user_profile, name='profile'),
    path('upload-profile-image/', views.upload_profile_image, name='upload_profile_image'),
]