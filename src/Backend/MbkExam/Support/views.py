from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets,status,generics
from .models import StudentClaim
from .serializers import StudentClaimSerializer 
from Notification.models import AdminNotification
from Exam.permissions import IsOwnerOrAdminOrNone
from django.db.models import Q
import math 

class StudentClaimViewSet(viewsets.ModelViewSet):
    serializer_class = StudentClaimSerializer
    queryset = StudentClaim.objects.all()
    lookup_field = 'slug'
    permission_classes = (IsOwnerOrAdminOrNone,)
    def get_queryset(self):
        search  = self.request.GET.get("search")
        if search : 
            return StudentClaim.objects.filter(Q(student__user__username__icontains=search)|Q(student__user__email__icontains=search)).exclude()
        return StudentClaim.objects.all()    


    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        nb_per_page = 2
        page_idx = 1
        search = self.request.GET.get('search')
        qs = StudentClaim.objects.all()
        print("hello ::::: ")
        print(qs.count())
        if search : 
            qs =  qs.filter(
                Q(student__user__username__icontains=search)|Q(student__user__email__icontains=search)
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = StudentClaimSerializer(qs,many=True,context={"request": request})
        serializer = self.get_serializer(qs, many=True)
        return Response({"claims" : serializer.data,"count":nb_of_pages})

    @action(methods=['GET'],detail=False)
    def custom_search(self,request):
        nb_per_page = 2
        page_idx = 1
        search = self.request.GET.get('search')
        qs = StudentClaim.objects.all()
        if search : 
            qs =  qs.filter(
                 Q(student__user__username__icontains=search)|Q(student__user__email__icontains=search)
            ).exclude()
        nb_of_pages = math.ceil(qs.count() / nb_per_page) 
        page_idx_inp = self.request.GET.get('page')
        if page_idx_inp and int(page_idx_inp) >= 1 and int(page_idx) <= (nb_of_pages-1) : 
            page_idx = int(page_idx_inp)
        qs = qs[(page_idx-1)*nb_per_page:(page_idx-1)*nb_per_page+nb_per_page]
        ser = StudentClaimSerializer(qs,many=True,context={"request": request})
        return Response({'claims':ser.data,'count':nb_of_pages},status=status.HTTP_200_OK) 
   

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        notif = self.request.GET.get('notif')    
        notif_obj_qs = AdminNotification.objects.filter(event_slug=instance.slug)
        if len(notif_obj_qs) > 0 and  notif_obj_qs[0].viewed == False :
            notif_obj_qs[0].viewed = True 
            notif_obj_qs[0].save()
        if not instance.viewed : 
            instance.viewed = True 
            instance.save()
            notif_obj = AdminNotification.objects.get(event_slug=instance.slug)
            if not notif_obj.viewed :
                notif_obj.viewed = True 
                notif_obj.save()           
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    def perform_create(self,serializer):
        serializer.save(student  = self.request.user.studentprofile)