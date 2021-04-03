from django.conf.urls import include
from django.urls import path
from rest_framework import routers
from .views import UserViewSet,StudentProfileViewSet,AdminProfileViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet)
router.register('studentprofile', StudentProfileViewSet)
router.register('adminprofile', AdminProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
