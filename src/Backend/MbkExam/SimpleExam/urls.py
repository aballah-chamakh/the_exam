from django.conf.urls import include
from django.urls import path
from rest_framework import routers
from .views import SimpleExamViewSet

router = routers.DefaultRouter()
router.register('simpleexam',SimpleExamViewSet)


urlpatterns = [
    path('', include(router.urls)),
]