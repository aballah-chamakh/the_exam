from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets,status,generics
from .models import User,StudentProfile,AdminProfile
from .serializers import UserSerializer,StudentProfileSerializer,AdminProfileSerializer
from .permissions import IsOwnerOrNone,PostOnly
from rest_framework_simplejwt.tokens import RefreshToken
from MbkExam.token import MyTokenObtainPairSerializer
from Notification.models import AdminNotification,StudentNotification
from Notification.serializers import StudentNotificationSerializer,AdminNotificationSerializer
from django.db.models import Q
from MbkExam.tasks import send_email_activation_code
import math 
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = (PostOnly,)
  
    def create(self,request,*args,**kwargs):
        data = request.data
        print(data)
        email  = request.data.get('email')
        if(data.get('is_student')):
            email_qs = User.objects.filter(email=email)
            ser = UserSerializer(data=data)
            if not ser.is_valid() : 
                return Response({'res':'email exist'},status=status.HTTP_409_CONFLICT)
            if email_qs : 
                print("email exist !! ")
                print(ser.data)
                return Response(ser.data,status=status.HTTP_409_CONFLICT)
            elif ser.is_valid() : 
                user_obj = ser.save()
                print("send email")
                task = send_email_activation_code.delay(user_obj.id)
                print(task)
                #send_email_activation_code.delay(user_obj.id)
                """
                studentprofile_obj = user_obj.studentprofile 
                refresh = MyTokenObtainPairSerializer.get_token(user_obj)
                res = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }  
                """  
                return Response({'res':'done'},status=status.HTTP_200_OK)
            else : 
                return Response({'res':'invalid data'},status=status.HTTP_400_BAD_REQUEST)
        return super(UserViewSet, self).create(request,*args,**kwargs)
    


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    queryset = StudentProfile.objects.all()
    permission_classes = (IsOwnerOrNone,)
    lookup_field = 'slug'
    
    def get_queryset(self):
        if not(self.request.user.is_authenticated) : 
            return []
        if self.request.user.is_admin :
            qs = StudentProfile.objects.all()
            return qs
        user_obj = self.request.user
        qs = StudentProfile.objects.filter(user=user_obj)
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        nb_per_page = 6
        page_idx = 1
        search = self.request.GET.get('search')
        qs = StudentProfile.objects.all()
        print("hello ::::: ")
        print(qs.count())
        if search : 
            qs =  qs.filter(
                Q(user__username__icontains=search) | Q(user__email__icontains=search)
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = StudentProfileSerializer(qs,many=True,context={"request": request})
        serializer = self.get_serializer(qs, many=True)
        return Response({"students" : serializer.data,"count":nb_of_pages})

    @action(methods=['GET'],detail=False)
    def custom_search(self,request):
        nb_per_page = 6
        page_idx = 1
        search = self.request.GET.get('search')
        qs = StudentProfile.objects.all()
        if search : 
            qs =  qs.filter(
                Q(user__username__icontains=search) | Q(user__email__icontains=search)
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = StudentProfileSerializer(qs,many=True,context={"request": request})
        return Response({'students':ser.data,'count':nb_of_pages},status=status.HTTP_200_OK) 
    @action(methods=['GET'],detail=True)
    def get_notifications(self,request,slug):
        studentprofile_obj = self.get_object()
        studentnotification_qs = studentprofile_obj.studentnotification_set.filter(viewed=False)
        ser = StudentNotificationSerializer(studentnotification_qs,many=True)
        return Response(ser.data,status=status.HTTP_200_OK) 
    """
    @action(methods=['GET'],detail=True)
    def get_notification_count(self,request,slug):
        studentprofile_obj = self.get_object()
        studentnotification_qs = studentprofile_obj.studentnotification_set.filter(viewed=False)
        return Response({'notification_count':studentnotification_qs.count()},status=status.HTTP_200_OK) """
    
    @action(methods=['PUT'],detail=True)
    def custom_update(self,request,slug):
        studentprofile_obj = self.get_object()
        user_obj = studentprofile_obj.user 
        username = request.data.get('username')
        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')
        image        = request.data.get('image')
        if old_password :
            if not user_obj.check_password(old_password) : 
                return Response({'response':'unauthorized'},status=status.HTTP_401_UNAUTHORIZED)    
        updated = False
        if image : 
            studentprofile_obj.image = image 
            studentprofile_obj.save()
            updated = True 
        if username != user_obj.username : 
            user_obj.username = username
            user_obj.save()
            updated = True
        if old_password and new_password and old_password != new_password:
            if user_obj.check_password(old_password) and user_obj.check_password(new_password) == False:
                user_obj.set_password(new_password)
                user_obj.save()
                updated = True
            else : 
                return Response({'response':'unauthorized'},status=status.HTTP_401_UNAUTHORIZED)
        if updated == True : 
            refresh = MyTokenObtainPairSerializer.get_token(user_obj)
            res = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }           
            return Response(res,status=status.HTTP_200_OK)
        return Response({'response':'you miss a field'},status=status.HTTP_400_BAD_REQUEST)
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_admin : 
            admin_notif = self.request.GET.get('admin_notif')
            notif_obj_qs = AdminNotification.objects.filter(event_slug=instance.slug,viewed=False)
            if  len(notif_obj_qs) > 0  :
                notif_obj_qs[0].viewed = True 
                notif_obj_qs[0].save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class AdminProfileViewSet(viewsets.ModelViewSet):
    serializer_class = AdminProfileSerializer
    queryset = AdminProfile.objects.all()
    lookup_field = 'slug'
    permissions_classes = (IsOwnerOrNone,)

    def get_queryset(self):
        if not(self.request.user.is_authenticated) : 
            return []
        user_obj = self.request.user 
        qs = self.queryset.filter(user=user_obj,user__admin=True)
        return qs 
   
    @action(methods=['PUT'],detail=True)
    def custom_update(self,request,slug):
        adminprofile_obj = self.get_object()
        user_obj = adminprofile_obj.user 

        username = request.data.get('username')
        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')
        image        = request.data.get('image')
        if old_password :
            if not user_obj.check_password(old_password) : 
                return Response({'response':'unauthorized'},status=status.HTTP_401_UNAUTHORIZED)      
        updated = False
        if image : 
            adminprofile_obj.image = image 
            adminprofile_obj.save()
            updated = True 
        if username != user_obj.username : 
            user_obj.username = username
            user_obj.save()
            updated = True
        if old_password and new_password and old_password != new_password:
            if user_obj.check_password(old_password) and user_obj.check_password(new_password) == False:
                user_obj.set_password(new_password)
                user_obj.save()
                updated = True
            else : 
                return Response({'response':'unauthorized'},status=status.HTTP_401_UNAUTHORIZED)
        if updated == True : 
            refresh = MyTokenObtainPairSerializer.get_token(user_obj)
            res = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }           
            return Response(res,status=status.HTTP_200_OK)
        return Response({'response':'you miss a field'},status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['GET'],detail=True)
    def get_notifications(self,request,slug):
        adminprofile_obj = self.get_object()
        nb_per_page = 10
        page_idx = 1
        adminnotification_qs = adminprofile_obj.adminnotification_set.filter(viewed=False)
        
        search = self.request.GET.get('search')
        if search : 
            adminnotification_qs = adminnotification_qs.filter(
                     Q(student__user__username__icontains=search) | Q(student__user__email__icontains=search)
                ).exclude() 
        nb_of_pages = math.ceil(adminnotification_qs.count() / nb_per_page)
        print("nb of notifs => "+str(adminnotification_qs.count()))
        page_idx_inp = self.request.GET.get('page') or -1
        print(page_idx_inp) 
        if page_idx_inp and page_idx_inp != 'undefined' and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        print("page_idx : {page_idx} / nb_per_page : {nb_per_page} / ".format(page_idx=page_idx,nb_per_page=nb_per_page))
        ser = AdminNotificationSerializer(adminnotification_qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page],many=True)
        print(" aaa => "+str(len(ser.data)))
        return Response({'notifications':ser.data,'count':nb_of_pages},status=status.HTTP_200_OK) 

    @action(methods=['GET'],detail=True)
    def get_notification_count(self,request,slug):
        adminprofile_obj = self.get_object()
        adminnotification_qs = adminprofile_obj.adminnotification_set.filter(viewed=False)
        return Response({'notification_count':adminnotification_qs.count()},status=status.HTTP_200_OK) 



