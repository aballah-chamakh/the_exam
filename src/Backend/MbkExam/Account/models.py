from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from .utils import unique_slug_generator
from datetime import datetime  

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None):

        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email,username, password):

        user = self.create_user(
            email,
            username=username,
            password=password,
        )
        user.staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email,username, password):

        user = self.create_user(
            email,
            username=username,
            password=password,
        )
        user.staff = True
        user.admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    email = models.EmailField(
            verbose_name='email address',
            max_length=255,
            unique=True,
        )
    username = models.CharField(max_length=255,)
    active = models.BooleanField(default=True)
    staff = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def get_full_name(self):

        return self.username

    def get_short_name(self):

        return self.username

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):

        return True

    def has_module_perms(self, app_label):

        return True

    @property
    def is_staff(self):

        return self.staff

    @property
    def is_admin(self):

        return self.admin

    @property
    def is_active(self):

        return self.active

class StudentProfile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,null=True,blank=True)
    image = models.ImageField(default='default_user_image.png')
    slug = models.SlugField(blank=True,null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    activated = models.BooleanField(default=False)
    def __str__(self):
        if(self.user) : 
            return self.user.email
        return 'no user available' 
    class Meta:
        ordering=['-joined_at']
    @property
    def owner(self):
        return self.user
    
    def get_last_active_exam(self):
        exam_obj =  self.exam_set.all().order_by("start_at").last()
        if exam_obj and exam_obj.status == "on going" : 
            return exam_obj
        return None 

class AdminProfile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    image = models.ImageField(default='default_user_image.png')
    slug = models.SlugField(blank=True,null=True)   
    #joined_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.user.email 
    @property
    def owner(self):
        return self.user
    


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created :
        if instance.is_student :
            student_obj = StudentProfile.objects.create(user=instance)
        else : 
            admin_obj = AdminProfile.objects.create(user=instance)

from time import sleep 

@receiver(pre_save, sender=AdminProfile)
def set_adminprofile_slug(sender, instance,**kwargs):
    print("set the slug for the admin")
    #sleep(30)
    value = instance.user and not(instance.slug) 
    print(value)
    if instance.user and not(instance.slug) :
        print("set admin slug for : "+str(instance.slug))
        instance.slug = unique_slug_generator(instance)

class ResetPasswordToken(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    token = models.CharField(max_length=500)
    exp_date = models.DateTimeField(auto_now_add=False,auto_now=False)
    expired = models.BooleanField(default=False)
    def __str__(self):
        return 'user : {username} / token : {token} / exp_data : {exp_date}'.format(username=self.user.username,token=self.token,exp_date=self.exp_date) 

class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User,on_delete=models.Model)
    code = models.CharField(max_length=500)
    exp_date = models.DateTimeField(auto_now_add=False,auto_now=False)
    expired = models.BooleanField(default=False)