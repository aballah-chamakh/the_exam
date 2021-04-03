from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets,status,generics
from .models import SimpleExam
from .serializers import SimpleExamSerializer



class SimpleExamViewSet(viewsets.ModelViewSet):
    serializer_class = SimpleExamSerializer
    queryset = SimpleExam.objects.all()
