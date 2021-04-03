from django.db import models

# Create your models here.

trading_type = [
    ("Short","Short"),
    ("Long","Long")
]
class SimpleExam(models.Model):
    title = models.CharField(max_length=255,default="Simple Exam")
    def __str__(self):
        return "id : {id} / title : {title}".format(id=self.id,title=self.title)

class Trade(models.Model):
    simple_exam = models.ForeignKey(SimpleExam,on_delete=models.CASCADE)
    pnl        = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    #datetime   = models.DateTimeField(auto_now_add=True, auto_now=False)
    instrument = models.CharField(max_length=255,blank=True,null=True)
    action      = models.CharField(max_length=255,choices=trading_type,blank=True,null=True)
    entry_datetime = models.DateTimeField(auto_now=False,auto_now_add=False,blank=True,null=True)
    exit_datetime = models.DateTimeField(auto_now=False,auto_now_add=False,blank=True,null=True)
    entry_price    = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    exit_price    = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    current_position = models.IntegerField(default=0)
    class Meta:
        ordering=['-entry_datetime']
    def get_execution_count(self):
        return self.execution_set.all().count()
class Execution(models.Model):
    trade    = models.ForeignKey(Trade,on_delete=models.CASCADE)
    price    = models.DecimalField(max_digits=20, decimal_places=10,default=0.0)
    action   = models.CharField(max_length=255,choices=trading_type,blank=True,null=True)
    quantity = models.IntegerField(default=0,blank=True,null=True)
    quantity_left = models.IntegerField(default=0,blank=True,null=True)
    is_entry = models.BooleanField(default=False,blank=True,null=True)
    is_exit = models.BooleanField(default=False,blank=True,null=True)
    instrument = models.CharField(max_length=255,blank=True,null=True)
    datetime   = models.DateTimeField(auto_now_add=False, auto_now=False,blank=True,null=True)
    ex_id = models.IntegerField(default=0)
    def __str__(self):
        return "hey {id}".format(id=self.id)
    class Meta:
        ordering=['id']