from django.db import models
from Account.models import StudentProfile,AdminProfile,User
from Support.models import StudentClaim 
from Exam.models import Exam 
from Account.utils import unique_slug_generator 
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q
# Create your models here.

NOTIF_EVENTS = (
    ('new_student_created','New Student Created'),
    ('new_exam_created','New Exam Created'),
    ('new_claim_created','New Claim Created'),
    ('certified','Certified'),
    ('not certified','Not Certified')
)

STUDENT_NOTIF_EVENTS =  (
    ('certified','Certified'),
    ('not certified','Not Certified')
)

class AdminNotification(models.Model):
    admin = models.ForeignKey(AdminProfile,on_delete=models.SET_NULL,null=True,blank=True)
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE,null=True,blank=True)
    event_type = models.CharField(max_length=255,choices=NOTIF_EVENTS)
    event_slug = models.SlugField()
    event_msg = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)
    def __str__(self):

        return "notif from the student  to the admin"
    class Meta:
        ordering=['-datetime']


class StudentNotification(models.Model):
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE)
    event_type = models.CharField(max_length=255,choices=STUDENT_NOTIF_EVENTS)
    event_slug = models.SlugField()
    event_msg = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)
    def __str__(self):
        return "notif for "+str(self.student.user.email)
    class Meta:
        ordering=['-datetime']
@receiver(post_save, sender=StudentProfile)
def create_notif_studentprofile(sender, instance, created, **kwargs):
    if created :
        instance.slug = unique_slug_generator(instance)
        instance.save()
        print(instance.slug)
        adminprofile_obj = AdminProfile.objects.first()
        AdminNotification.objects.create(admin=adminprofile_obj, 
                                    student = instance,
                                    event_type="new_student_created",
                                    event_msg = "a new student was just created",
                                    event_slug=instance.slug
                                    )
@receiver(post_save, sender=StudentClaim)
def create_notif_studentclaim(sender, instance, created, **kwargs):
    if created :
        instance.slug = unique_slug_generator(instance)
        instance.save()
        adminprofile_obj = AdminProfile.objects.first()
        AdminNotification.objects.create(admin=adminprofile_obj, 
                                    student=instance.student,
                                    event_type="new_claim_created",
                                    event_msg = "a new claim was just received from a student",
                                    event_slug=instance.slug
                                    )
@receiver(post_save, sender=Exam)
def create_notif_exam(sender, instance, created, **kwargs):
    if created :
        instance.slug = unique_slug_generator(instance)
        instance.save()
        print(instance.slug)
        adminprofile_obj = AdminProfile.objects.first()
        AdminNotification.objects.create(admin=adminprofile_obj, 
                                    student=instance.student,
                                    event_type="new_exam_created",
                                    event_msg = "a new exam exam was just created",
                                    event_slug=instance.slug
                                    )


