from rest_framework import serializers 
from .models import Exam,ExamSetting
from SimpleExam.models import SimpleExam 
from django.contrib.contenttypes.models import ContentType
from datetime import datetime 
from SimpleExam.serializers import TradeSerializer

#from SimpleExam.serializers import Trade 


class ExamExpirationDateSerializer(serializers.ModelSerializer):
    class Meta : 
        model = Exam 
        fields = ('id','end_at')
class ExamSerializer(serializers.ModelSerializer):
    exam_type_title = serializers.CharField(source='exam_type_object.title',read_only=True)
    exam_type_id = serializers.IntegerField(source='exam_type_object.id',read_only=True)
    content = serializers.SerializerMethodField(read_only=True)
    slug = serializers.SlugField(read_only=True)
    exam_time_utc = serializers.JSONField(write_only=True)
    certificate_filename = serializers.CharField(source="certificate",read_only=True)
    certificate_url = serializers.SerializerMethodField()
    current_pnl = serializers.SerializerMethodField()
    initial_balance = serializers.SerializerMethodField()
    current_balance = serializers.SerializerMethodField()
    student_image = serializers.CharField(source="student.image.url",read_only=True)
    student_username = serializers.CharField(source="student.user.username",read_only=True)
    student_email = serializers.CharField(source="student.user.email",read_only=True)
    student_slug = serializers.CharField(source="student.slug",read_only=True)
    class Meta : 
        model = Exam 
        fields = ('id','slug','student_slug','student_username','student_image','student_email','certificate_url','exam_type_title','exam_type_id','name','content','exam_time_utc','start_at','end_at','status','certificate_filename','certified','score','note','initial_balance','current_balance','current_pnl')

    def get_content(self,exam_obj):
        # once we have multiple exam_type we will use a switch statemnt to code each type uniquely
        if(type(exam_obj.exam_type_object).__name__ == "SimpleExam"):
           trades_qs = exam_obj.exam_type_object.trade_set.all()
           serializer = TradeSerializer(trades_qs,many=True)
           return serializer.data 
    def get_current_pnl(self,exam_obj):
        if(exam_obj.initial_balance and exam_obj.current_balance):
            print("initial balance => "+str(exam_obj.initial_balance))
            print("current balance => "+str(exam_obj.current_balance))
            if (exam_obj.current_balance - exam_obj.initial_balance) == 0 : 
                return 0
            return (exam_obj.current_balance - exam_obj.initial_balance)
        else  : 
            return 0
    def get_initial_balance(self,exam_obj):
        if(exam_obj.initial_balance > 0 ):           
            return exam_obj.initial_balance
        return 0
    def get_current_balance(self,exam_obj):
        if(exam_obj.current_balance > 0):
            return exam_obj.current_balance
        return 0
    def get_certificate_url(self,exam_obj):
        if not exam_obj.certificate : 
            return None 
        return exam_obj.certificate.url
    def create(self,validated_data):
        exam_time_utc = validated_data['exam_time_utc'] 
        print(exam_time_utc)
        start_at = datetime(exam_time_utc['start_at']['year'],exam_time_utc['start_at']['month'],exam_time_utc['start_at']['day'],exam_time_utc['start_at']['hours'],exam_time_utc['start_at']['minutes'],exam_time_utc['start_at']['seconds'])
        end_at = datetime(exam_time_utc['end_at']['year'],exam_time_utc['end_at']['month'],exam_time_utc['end_at']['day'],exam_time_utc['end_at']['hours'],exam_time_utc['end_at']['minutes'],exam_time_utc['end_at']['seconds'])
        del validated_data['exam_time_utc'] 
        exam_obj = Exam.objects.create(**validated_data,start_at=start_at,end_at=end_at)
        simpleexam_obj = SimpleExam.objects.create()
        exam_obj.content_type = ContentType.objects.get_for_model(simpleexam_obj)
        exam_obj.object_id = simpleexam_obj.id 
        exam_obj.save()
        return exam_obj 


class ExamSettingSerializer(serializers.ModelSerializer):
    class Meta :
        model = ExamSetting
        fields = ('id','marketcode','numberofdays',)
    
        
