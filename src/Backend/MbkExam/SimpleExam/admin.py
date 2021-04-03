from django.contrib import admin

# Register your models here.f
from .models import SimpleExam,Trade,Execution 

admin.site.register(SimpleExam)
admin.site.register(Trade)
admin.site.register(Execution)