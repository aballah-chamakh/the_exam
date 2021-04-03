from rest_framework import serializers
from .models import AdminNotification,StudentNotification

class AdminNotificationSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.user.username')
    student_img = serializers.CharField(source="student.image.url")
    student_slug = serializers.SlugField(source="student.slug")
    student_email = serializers.CharField(source="student.user.email")
    class Meta : 
        model = AdminNotification 
        fields = ('student_email','student_img','student_username',"student_slug",'event_type','event_msg','event_slug','datetime','viewed')

class StudentNotificationSerializer(serializers.ModelSerializer):
    student_slug = serializers.SlugField(source="student.slug")
    class Meta : 
        model = StudentNotification
        fields = ('student_slug','event_type','event_msg','event_slug','datetime','viewed')