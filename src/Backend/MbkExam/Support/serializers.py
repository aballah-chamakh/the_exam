from rest_framework import serializers
from .models import StudentClaim

class StudentClaimSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.user.username',read_only=True)
    student_email = serializers.CharField(source='student.user.email',read_only=True)
    student_img = serializers.CharField(source="student.image.url",read_only=True)
    student_slug =serializers.CharField(source="student.slug",read_only=True)
    class Meta : 
        model = StudentClaim 
        fields = ('slug','viewed','student_username','student_email','student_img','subject','content','datetime','student_slug')