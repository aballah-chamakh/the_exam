from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets,status,generics
from .models import Exam,ExamSetting
from .serializers import ExamSerializer,ExamSettingSerializer,ExamExpirationDateSerializer
from .permissions import IsOwnerOrAdminOrNone
from Notification.models import AdminNotification,StudentNotification
from django.db.models import Q
import math 


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    queryset = Exam.objects.all()
    model  = Exam
    lookup_field = 'slug' 
    #permission_classes = (IsOwnerOrAdminOrNone,)
    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        nb_per_page = 6
        page_idx = 1
        search = self.request.GET.get('search')
        status_ = self.request.GET.get('status')
        qs = Exam.objects.all()
        if status_ and status_ != 'exam_status' : 
            qs = qs.filter(status=status_.replace('_',''))
        if search : 
            qs =  qs.filter(
                Q(student__user__username__icontains=search) | Q(student__user__email__icontains=search) | Q(name__icontains=search) 
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = ExamSerializer(qs,many=True,context={"request": request})
        serializer = self.get_serializer(qs, many=True)
        return Response({"exams" : serializer.data,"count":nb_of_pages})

    @action(methods=['GET'],detail=False)
    def custom_search(self,request):
        nb_per_page = 6
        page_idx = 1
        search = self.request.GET.get('search')
        status_ = self.request.GET.get('status')
        qs = Exam.objects.all()
        if status_ and status_ != 'exam_status' : 
            qs = qs.filter(status=status_.replace('_',' '))
        if search : 
            qs =  qs.filter(
                Q(student__user__username__icontains=search) | Q(student__user__email__icontains=search) | Q(name__icontains=search) 
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = ExamSerializer(qs,many=True,context={"request": request})
        return Response({'exams':ser.data,'count':nb_of_pages},status=status.HTTP_200_OK) 
    def get_queryset(self):
        if not self.request.user.is_authenticated : 
            return []
        if self.request.user.is_admin : 
            return self.queryset 
        qs = self.queryset.filter(student=self.request.user.studentprofile)
        return  qs 
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        admin_notif = self.request.GET.get('admin_notif')
        student_notif = self.request.GET.get('student_notif')
        notif_obj_qs = AdminNotification.objects.filter(event_slug=instance.slug,viewed=False)
        if len(notif_obj_qs) > 0 : 
            notif_obj_qs[0].viewed = True 
            notif_obj_qs[0].save()
            
        notif_obj_qs = StudentNotification.objects.filter(event_slug=instance.slug,viewed=False)
        if len(notif_obj_qs) > 0 : 
            notif_obj_qs[0].viewed = True 
            notif_obj_qs[0].save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    @action(methods=['GET'],detail=False)
    def get_ongoing(self,request):
        exams = Exam.objects.filter(status="on going")
        serializer = ExamExpirationDateSerializer(exams,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    @action(methods=['PUT'],detail=False)
    def set_exams_expired(self,request):
        exams_id = request.data.get("exams_id")
        if exams_id  :
            for exam_id in exams_id : 
                current_exam = Exam.objects.get(id=exam_id)
                current_exam.status = "in review"
                print("set {current_exam} to in review".format(current_exam=current_exam.name))
                current_exam.save()
        return Response({'res':'done'},status=status.HTTP_200_OK)
    @action(methods=['PUT'],detail=True)
    def set_result(self,request,slug):
        exam_obj = self.get_object()
        certificate = request.data.get('certificate')
        note = request.data.get('note')
        score = request.data.get('score')
        exam_obj.note = note 
        exam_obj.score = score 
        student_notification_obj = StudentNotification.objects.create(event_slug=exam_obj.slug,
                                                                      student=exam_obj.student)
        if certificate and certificate != "null" : 
            exam_obj.certificate = certificate
            exam_obj.certified = True 
            exam_obj.status = "succeeded"
            exam_obj.save()
            student_notification_obj.event_type = "certified"
            student_notification_obj.event_msg = "congratulation your are certified"
            student_notification_obj.save()
        else:  
            exam_obj.status = "failed"
            if exam_obj.certified == True :
                exam_obj.certified = False
            exam_obj.save()
            student_notification_obj.event_type = "not_certified"
            student_notification_obj.event_msg = "good luck for the nex time"
            student_notification_obj.save()
        ser = ExamSerializer(exam_obj,many=False)
        return Response(ser.data,status=status.HTTP_200_OK)
    def perform_create(self, serializer):
        student_obj = self.request.user.studentprofile
        serializer.save(student=student_obj)
        
class ExamSettingViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSettingSerializer
    queryset = ExamSetting.objects.all()
    model = ExamSetting
    permission_classes = (IsOwnerOrAdminOrNone,)

    def list(self,request):
        active_settingexam = self.model.objects.filter(active=True)
        if active_settingexam : 
            active_settingexam = active_settingexam[0]
        else : 
            active_settingexam = self.model.objects.create(active=True)
        ser = self.get_serializer(active_settingexam,many=False)
        return Response(ser.data)



    


 