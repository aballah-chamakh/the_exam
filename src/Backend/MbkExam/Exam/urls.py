from django.conf.urls import include
from django.urls import path
from rest_framework import routers
from .views import ExamViewSet,ExamSettingViewSet

router = routers.DefaultRouter()
router.register('exam', ExamViewSet)
router.register('examsetting', ExamSettingViewSet)

urlpatterns = [

    path('', include(router.urls)),
]