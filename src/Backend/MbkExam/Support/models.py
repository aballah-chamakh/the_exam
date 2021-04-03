from django.db import models
from Account.models import StudentProfile 
from rest_framework import routers
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from Account.utils import unique_slug_generator
# Create your models here.
class StudentClaim(models.Model):
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    content = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(blank=True,null=True)
    viewed = models.BooleanField(default=False)

    def __str__(self):
        return self.student.user.username+' => '+self.subject 
        
    class Meta:
        ordering=['-datetime']
