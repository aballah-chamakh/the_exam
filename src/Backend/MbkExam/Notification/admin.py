from django.contrib import admin
from .models import AdminNotification,StudentNotification
# Register your models here.

admin.site.register(AdminNotification)
admin.site.register(StudentNotification)
