from .celery import app
from django.core.mail import send_mail
from Account.models import EmailVerificationCode,ResetPasswordToken,User 
from Exam.models import Exam
from Account.utils import random_string_generator
from django.core.mail import EmailMessage
import datetime 
from django.template.loader import get_template
from celery.schedules import crontab
from celery import shared_task
from SimpleExam.models import Execution,Trade
from rest_framework_simplejwt.exceptions import InvalidToken
from decimal import Decimal,InvalidOperation
import math
import pytz


utc=pytz.UTC


def generate_token(size=20):
    token = random_string_generator(size)
    qs = ResetPasswordToken.objects.filter(token=token)
    if len(qs) > 0 : 
        generate_token()
    return token 

def generate_code(size=30):
    code = random_string_generator(size)
    qs = EmailVerificationCode.objects.filter(code=code)
    if len(qs) > 0 : 
        generate_code()
    return code


@app.task(bind=True)
def send_email_activation_code(self,user_id):
    code = generate_code()
    user_obj = User.objects.get(id=user_id)
    qs = EmailVerificationCode.objects.filter(user=user_obj,expired=False)
    for emailverificationcode_obj in qs : 
        #emailverificationcode_obj.expired = True 
        emailverificationcode_obj.delete()
    message = get_template("email_verification_code.html").render({
        'data': {'code':code,'expiration_delta_min':5},
    })
    exp_date = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    emailverificationcode_obj = EmailVerificationCode.objects.create(user=user_obj,exp_date=exp_date,code=code)
    mail = EmailMessage(
        subject="Verify your email",
        body=message,
        from_email="chamakhabdallah8@gmail.com",
        to=["chamakhabdallah8@gmail.com"],
    )
    mail.content_subtype = "html"
    mail.send()    

@app.task(bind=True)
def send_reset_password_email(self,user_id):
    token = generate_token()
    user_obj = User.objects.get(id=user_id)
    qs = ResetPasswordToken.objects.filter(user=user_obj,expired=False)
    for resetpasswordtoken_obj in qs : 
        #resetpasswordtoken_obj.expired = True 
        resetpasswordtoken_obj.delete()
    message = get_template("reset_password.html").render({
        'data': {'reset_password_token':token},
    })
    exp_date = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    resetpasswordtoken_obj = ResetPasswordToken.objects.create(user=user_obj,exp_date=exp_date,token=token)
    mail = EmailMessage(
        subject="Reset Password",
        body=message,
        from_email="chamakhabdallah8@gmail.com",
        to=["chamakhabdallah8@gmail.com"],
    )
    mail.content_subtype = "html"
    mail.send() 

    #send_mail('reset password','token : '+token,'chamakhabdallah8@gmail.com',('chamakhabdallah8@gmail.com',))
@app.task(bind=True)
def check_expired_dates(self):
    qs = ResetPasswordToken.objects.filter(expired=False)
    print("check_expired_dates task is triggered")
    print(qs)
    for reset_password_token__obj in qs : 
        dt_utcnow = datetime.datetime.utcnow()
        if utc.localize(dt_utcnow) >= reset_password_token__obj.exp_date : 
            print("dt_now : {dt_now} | exp_date : {exp_date}".format(dt_now=utc.localize(dt_utcnow),exp_date=reset_password_token__obj.exp_date))
            print("expired :: ")
            reset_password_token__obj.expired = True 
            reset_password_token__obj.save()
        else : 
            print("not expired ::")
    qs = Exam.objects.all()
    print("exam list : ")
    for exam_obj in qs : 
        dt_utcnow = datetime.datetime.utcnow()
        print("dt_now : {dt_now} | end_at : {end_at}".format(dt_now=utc.localize(dt_utcnow),end_at=exam_obj.end_at))
        if utc.localize(dt_utcnow) > exam_obj.end_at : 
            exam_obj.status = "in review"
            exam_obj.save()
    qs = EmailVerificationCode.objects.filter(expired=False)
    print("email verification list : ")
    for emailverificationcode_obj in qs :
        dt_utcnow = datetime.datetime.utcnow()
        if utc.localize(dt_utcnow) >= emailverificationcode_obj.exp_date : 
            print("dt_now : {dt_now} | exp_date : {exp_date}".format(dt_now=utc.localize(dt_utcnow),exp_date=emailverificationcode_obj.exp_date))
            emailverificationcode_obj.expired = True 
            emailverificationcode_obj.save()
@app.task(bind=True)
def handle_execution(self,exam_id,trade_id,execution_format_json):
    exam_obj = Exam.objects.get(id=exam_id)
    last_not_exited_trade = Trade.objects.get(id=trade_id)
    if(exam_obj.first_trade_has_one_execution() == True) : 
        exam_obj.initial_balance = Decimal(round(float(execution_format_json['CurrentBalance'].replace(',',".")),7))
        exam_obj.current_balance = Decimal(round(float(execution_format_json['CurrentBalance'].replace(',',".")),7))
        exam_obj.save()
    tick_size = float(execution_format_json['TickSize'].replace(',',"."))
    tick_value = float(execution_format_json['TickValue'].replace(',',"."))
    execution_datetime = execution_format_json['Datetime']
    execution_date = execution_format_json['Datetime'].split(" ")[0]
    execution_date = execution_date[:-4]+execution_date[len(execution_date)-2]+execution_date[len(execution_date)-1]
    execution_time = execution_format_json['Datetime'].split(" ")[1]
    execution_datetime = execution_date+" "+execution_time

    execution_obj = Execution.objects.create(
            trade=last_not_exited_trade,
            #price =float(787723.5),
            price=round(float(execution_format_json['Price'].replace(",",".")),7),
            instrument = execution_format_json['Instrument'],
            datetime = datetime.datetime.strptime(execution_datetime,'%d/%m/%y %H:%M:%S')+datetime.timedelta(days=1),
            action = execution_format_json['Action'],
            is_entry = True if execution_format_json['isEntry'] == "True" else False ,
            is_exit = True if execution_format_json['isExit'] == "True" else False,
            quantity = int(execution_format_json['Quantity']),
            quantity_left = int(execution_format_json['Quantity']),
            ex_id=int(execution_format_json['Id'])
        )
    if execution_obj.action == "Long" : 
        last_not_exited_trade.current_position += int(execution_obj.quantity)
    else : 
        last_not_exited_trade.current_position -= int(execution_obj.quantity)
    last_not_exited_trade.save()
    trade_main_action = last_not_exited_trade.action 
    if trade_main_action == "Short" and execution_obj.action == "Long":
        short_executions = last_not_exited_trade.execution_set.all().order_by("datetime").filter(quantity_left__gt=0,action="Short")
        if short_executions.count() > 0 :
            for execution in short_executions :
                if execution_obj.quantity_left == 0 : 
                    break  
                if execution.quantity_left >= execution_obj.quantity_left: 
                    last_not_exited_trade.pnl +=  Decimal(round(((round(float(execution.price) - float(execution_obj.price),7))/tick_size)*execution_obj.quantity_left*tick_value,7))  
                    last_not_exited_trade.save()
                    execution.quantity_left -= execution_obj.quantity_left
                    execution_obj.quantity_left = 0
                    execution_obj.save()
                    execution.save()
                else : 
                    quantity_consumed = execution.quantity if execution.quantity_left == 0 else execution.quantity_left
                    last_not_exited_trade.pnl +=  Decimal(round(((float(execution.price) - float(execution_obj.price))/tick_size)*quantity_consumed*tick_value,7))
                    last_not_exited_trade.save()
                    execution_obj.quantity_left -= quantity_consumed
                    execution.quantity_left = 0
                    execution_obj.save()
                    execution.save()
    elif trade_main_action == "Long" and execution_obj.action == "Short" : 
        long_executions = last_not_exited_trade.execution_set.all().order_by("id").filter(quantity_left__gt=0,action="Long")
        if long_executions.count() > 0 :
            for execution in long_executions :
                if execution_obj.quantity_left == 0 :
                    break  
                if execution.quantity_left >= execution_obj.quantity_left:
                    last_not_exited_trade.pnl +=  Decimal(round(((round((float(execution_obj.price) - float(execution.price))/tick_size,7)))*execution_obj.quantity_left*tick_value,7))
                    last_not_exited_trade.save()
                    execution.quantity_left -= execution_obj.quantity_left
                    execution_obj.quantity_left = 0
                    execution_obj.save()
                    execution.save()
                else : 
                    quantity_consumed = execution.quantity if execution.quantity_left == 0 else execution.quantity_left
                    last_not_exited_trade.pnl +=  Decimal(round(((round((float(execution_obj.price) - float(execution.price))/tick_size,7)))*quantity_consumed*tick_value,7))
                    last_not_exited_trade.save()
                    execution_obj.quantity_left -= quantity_consumed
                    execution.quantity_left = 0
                    execution_obj.save()
                    execution.save()

    if last_not_exited_trade.get_execution_count() == 1 and execution_obj.is_entry : 
        last_not_exited_trade.entry_datetime =  execution_obj.datetime + datetime.timedelta(days=1)
        last_not_exited_trade.action = execution_obj.action 
        last_not_exited_trade.instrument = execution_obj.instrument
        last_not_exited_trade.entry_price = Decimal(execution_obj.price) 
        last_not_exited_trade.save()
    elif last_not_exited_trade.get_execution_count() > 1 and execution_obj.is_exit and last_not_exited_trade.current_position == 0  : 
        last_not_exited_trade.exit_datetime =  execution_obj.datetime + datetime.timedelta(days=1)
        last_not_exited_trade.exit_price = Decimal(execution_obj.price)
        exam_obj.current_balance = exam_obj.current_balance + last_not_exited_trade.pnl
        exam_obj.save()
        last_not_exited_trade.save() 




