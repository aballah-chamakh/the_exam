from django.conf.urls import include
from django.urls import path
from rest_framework import routers
from .views import StudentClaimViewSet

router = routers.DefaultRouter()
router.register('studentclaim', StudentClaimViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
