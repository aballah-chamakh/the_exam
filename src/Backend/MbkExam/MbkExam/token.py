from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from rest_framework import exceptions


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
            'password': attrs['password'],
        }
        user_obj = authenticate(**authenticate_kwargs)
        if user_obj.is_student : 
            if not(user_obj.studentprofile.activated):
                raise exceptions.PermissionDenied()
        return data 

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.admin : 
            token['adminprofile_slug'] = user.adminprofile.slug 
            token['adminprofile_image'] = user.adminprofile.image.url
            token['adminprofile_username'] = user.username
            token['is_admin'] = user.admin
            token['is_student'] = user.is_student
            print("admin token => ")
            print(token)
            return token
        elif user.is_student :

            token['studentprofile_slug'] = user.studentprofile.slug 
            token['studentprofile_image'] = user.studentprofile.image.url
            token['studentprofile_username'] = user.username
            token['is_student'] = user.is_student
            token['is_admin'] = user.admin
            print("student token")
            print(token)
            return token
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer