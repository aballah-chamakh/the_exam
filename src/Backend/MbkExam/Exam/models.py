from django.db import models
from Account.models import StudentProfile
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from Account.utils import unique_slug_generator
from SimpleExam.models import SimpleExam,Trade

STATUS_CHOICES = (
    ('on going','On going'),
    ('in review','In review'),
    ('failed','Failed'),
    ('succeeded','Succeeded'),
)

class Exam(models.Model):
    student          = models.ForeignKey(StudentProfile,on_delete=models.SET_NULL,null=True)
    name             = models.CharField(max_length=255)
    content_type     = models.ForeignKey(ContentType, on_delete=models.CASCADE,null=True)
    object_id        = models.PositiveIntegerField(null=True)
    exam_type_object = GenericForeignKey('content_type', 'object_id')
    slug = models.SlugField()
    start_at = models.DateTimeField(auto_now_add=False,auto_now=False,null=True,blank=True)
    end_at = models.DateTimeField(auto_now_add=False,auto_now=False,null=True,blank=True)
    status = models.CharField(max_length=255,choices=STATUS_CHOICES,default='on going')
    certificate = models.FileField(blank=True,null=True)
    certified = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    note = models.TextField(blank=True,null=True)
    initial_balance = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    current_balance = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    def __str__(self):
        return "exam_name : {exam_name}".format(exam_name=self.name)

    class Meta:
        ordering=['-start_at']
    def get_last_not_exited_trade(self,instrument):
        simple_exam_obj = SimpleExam.objects.get(id=self.object_id)
        #filter(instrument=instrument)
        last_trade_obj = simple_exam_obj.trade_set.filter(instrument=instrument).order_by("entry_datetime").last()

        """if len(last_trade_obj) > 0 : 
            last_trade_obj = last_trade_obj.last()
        else : 
            last_trade_obj = None """
        if not(last_trade_obj) or last_trade_obj.exit_datetime != None : 
            last_trade_obj = Trade.objects.create(simple_exam=simple_exam_obj)
            print("create a new trade obj : ")
            return last_trade_obj
        return last_trade_obj
    def get_trade_count(self):
        simple_exam_obj = SimpleExam.objects.get(id=self.object_id)
        return simple_exam_obj.trade_set.all().count()
    def first_trade_has_one_execution(self): 
        simple_exam_obj = SimpleExam.objects.get(id=self.object_id)
        exam_trades = simple_exam_obj.trade_set.all()
        if len(exam_trades) == 0 : 
            return False
        first_trade = exam_trades.first()
        if(len(first_trade.execution_set.all()) == 0):
            return True 
        return False 


class ExamSetting(models.Model):
    active = models.BooleanField(default=False)
    numberofdays = models.IntegerField(default=20)
    marketcode = models.CharField(max_length=255,default="GC")

    def __str__(self):
        return "number_of_days : {numberofdays} / marketcode : {marketcode} / active : {active}".format(numberofdays=self.numberofdays,
                                                                                                        marketcode=self.marketcode,
                                                                                                        active=self.active)
