"""MbkExam URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import TokenRefreshView
from .token import MyTokenObtainPairView
from django.conf.urls.static import static
from django.conf import settings
from .views import resendEmailActivationCode,verifyEmailActivationCode,verifyToken,get_token,set_execution,get_dashboard,reset_email_password,reset_password

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('Exam.urls')),
    path('api/',include('SimpleExam.urls')),
    path('api/',include('Account.urls')),
    path('api/',include('Support.urls')),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('ninja/token/', get_token),
    path('ninja/execution/', set_execution),
    path('api/get_dashboard/', get_dashboard),
    path('api/reset_email_password/', reset_email_password),
    path('api/verify_token/', verifyToken),
    path('api/reset_password/',reset_password),
    path('api/verify_email_activation_code/',verifyEmailActivationCode),
    path('api/resend_email_activation_code/',resendEmailActivationCode),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
if settings.DEBUG :
    urlpatterns+=static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
    urlpatterns+=static(settings.STATIC_URL,document_root=settings.STATIC_ROOT)

