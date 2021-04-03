from rest_framework import serializers
from .models import StudentProfile,AdminProfile,User
from Exam.serializers import ExamSerializer
from Exam.models import ExamSetting 



class EmailSerializer(serializers.Serializer):
    email  = serializers.EmailField()

class ResetPassswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField()
    confirmPassword = serializers.CharField()

class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()

class CodeSerializer(serializers.Serializer):
    code = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    #image = serializers.CharField(source='image.url',read_only=True)
    password = serializers.CharField(style={'input_type':'password'},write_only=True,required=True)
    confirmPassword = serializers.CharField(style={'input_type':'password'},write_only=True,required=True)
    class Meta : 
        model = User 
        fields = ('id','email','username','password','confirmPassword','admin','is_student')
    def validate(self,data):
        email = data.get('email')
        qs = User.objects.filter(email=email)
        if qs :
            raise serializers.ValidationError('email already exist')
        pw1 = data.get('password')
        pw2 = data.get('confirmPassword')
        # chech if the two password match
        if pw1 != pw2 :
            raise serializers.ValidationError('Passwords should match')
        return data

    def create(self,validated_data):
        print('create baby !! ')
        password = validated_data.get('password')
        del validated_data['password']
        del validated_data['confirmPassword']
        user_obj = User(**validated_data)
        user_obj.set_password(password)
        user_obj.save()
        return user_obj

class StudentProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    exams = serializers.SerializerMethodField()
    email = serializers.CharField(source="user.email")
    exams_taken = serializers.SerializerMethodField()
    new_exam_allowed = serializers.SerializerMethodField()
    exam_days = serializers.SerializerMethodField()
    image = serializers.CharField(source="image.url")
    class Meta : 
        model = StudentProfile
        fields = ('user_id','new_exam_allowed','slug','username','email','image','exams','joined_at','exams_taken','exam_days')

    def get_exams(self,studentprofile_obj):
        exams_qs = studentprofile_obj.exam_set.all()
        ser = ExamSerializer(exams_qs,many=True)
        return ser.data 
    def get_exams_taken(self,studentprofile_obj): 
        return studentprofile_obj.exam_set.all().count()
    
    def get_new_exam_allowed(self,studentprofile_obj):  
        exams_ongoing_qs = studentprofile_obj.exam_set.filter(status="on going")
        exams_succeeded_qs = studentprofile_obj.exam_set.filter(status="succeeded")
        if len(exams_ongoing_qs) > 0 or len(exams_succeeded_qs) > 0 : 
            return False
        return True  
    def get_exam_days(self,studentprofile_obj):
        exam_setting_obj = ExamSetting.objects.filter(active=True)[0]
        return exam_setting_obj.numberofdays


class AdminProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    email = serializers.CharField(source="user.email")
    image = serializers.CharField(source="image.url")
    class Meta : 
        model = AdminProfile
        fields = ('user_id','slug','username','image','email')

