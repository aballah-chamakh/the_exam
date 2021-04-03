from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from Account.models import User,StudentProfile,EmailVerificationCode
from Exam.models import Exam 
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.http import require_http_methods
from SimpleExam.models import Execution 
from datetime import datetime 
from rest_framework.decorators import api_view
from rest_framework import status
from Account.serializers import CodeSerializer,EmailSerializer,ResetPassswordSerializer,TokenSerializer
from Account.models import ResetPasswordToken
from .tasks import send_reset_password_email,send_email_activation_code
from django.shortcuts import render
from rest_framework_simplejwt.exceptions import InvalidToken
from decimal import Decimal,InvalidOperation
from .tasks import handle_execution 
# Response : aaaa[]aaaa
# Error : 
# receive an email from the user then send to this email a reset password

def hello_world(request):
    return render(request, 'reset_password.html', {'reset_password_token':"aaaaa"})

@api_view(["PUT"])
def reset_email_password(request):
    print(request.data)
    ser = EmailSerializer(data=request.data,many=False)
    if ser.is_valid() : 
        user_obj = User.objects.filter(email=ser.data['email'])
        print(user_obj)
        if user_obj : 
            # send an email 
            send_reset_password_email.delay(user_obj.first().id)
            return Response({'res':{'Exist':True}},status=status.HTTP_200_OK)
        else : 
            return Response({'res':{'Exist':False}},status=status.HTTP_401_UNAUTHORIZED)
    else : 
        return Response({'res':'you did miss the email field'},status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
def resendEmailActivationCode(request):
    ser = EmailSerializer(data=request.data)
    if ser.is_valid() : 
        print(ser.data['email'])
        user_qs = User.objects.filter(email=ser.data['email'])
        if len(user_qs) > 0 : 
            user_obj = user_qs.first()
            # send user activation code here !!
            send_email_activation_code.delay(user_obj.id)
            return Response({'done':True},status=status.HTTP_200_OK)
        else : 
            return Response({'done':False},status=status.HTTP_401_UNAUTHORIZED)

    return Response({'res':'you did miss one of the fields'},status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
def verifyEmailActivationCode(request):
    ser = CodeSerializer(data=request.data)
    if ser.is_valid() : 
        code = ser.data['code']
        print(code)
        email_verification_code_qs = EmailVerificationCode.objects.filter(code=code)
        #for email_verification_code_obj in email_verification_code_qs : 
         #   print("code : {code} | expired : {expired}".format(code=email_verification_code_obj.code,expired=email_verification_code_obj.expired))
        if(email_verification_code_qs.count() == 0) or (email_verification_code_qs.count() > 0 and email_verification_code_qs.first().expired == True) : 
            return Response({'expired':True},status=status.HTTP_200_OK)
        email_verification_code_obj = email_verification_code_qs.first()
        email_verification_code_obj.expired = False 
        student_obj = email_verification_code_obj.user.studentprofile
        student_obj.activated = True 
        student_obj.save()
        return Response({'expired':False},status=status.HTTP_200_OK)        
    return Response({'res':'you did miss one of the fields'},status=status.HTTP_400_BAD_REQUEST)
# check if resetPasswordToken is not Expired
@api_view(["PUT"])
def verifyToken(request):
    ser = TokenSerializer(data=request.data)
    if ser.is_valid() : 
        token = ser.data['token']
        reset_password_token__qs = ResetPasswordToken.objects.filter(token=token)
        #for reset_password_token_obj in reset_password_token__qs : 
         #   print("token : {token} expired : {expired}".format(token=reset_password_token_obj.token,expired=reset_password_token_obj.expired))
        if(reset_password_token__qs.count() == 0) or (reset_password_token__qs.count() > 0 and reset_password_token__qs.first().expired == True) : 
            return Response({'expired':True},status=status.HTTP_200_OK)
        return Response({'expired':False},status=status.HTTP_200_OK)
    return Response({'res':'you did miss one of the fields'},status=status.HTTP_400_BAD_REQUEST)
@api_view(["PUT"])
def reset_password(request):
    print(request.data)
    ser = ResetPassswordSerializer(data=request.data,many=False)
    if ser.is_valid() :
        token = ser.data['token']
        reset_password_token__qs = ResetPasswordToken.objects.filter(token=token,expired=False)
        if len(reset_password_token__qs) == 0 : 
            return Response({'expired':True},status=status.HTTP_200_OK)
        user_obj = reset_password_token__qs.first().user 
        password = ser.data['password']
        confirmPassword  = ser.data['confirmPassword']
        user_obj.set_password(password)
        user_obj.save()    
        return Response({'expired':False},status=status.HTTP_200_OK)
    else : 
        return Response({'res':'you did miss one of the fields'},status=status.HTTP_400_BAD_REQUEST)

@require_http_methods(["POST",])
@csrf_exempt 
def get_token(request):
    email = request.POST.get('email')
    password = request.POST.get('password')
    # check email and password are well received
    if not(email and password) : 
        # ban the ip address later 
        return HttpResponse("You're banned baby",status=403)
    user_obj = User.objects.filter(email=email).first() or None  
    is_student = False 
    has_exam = False
    # check user credentials 
    if user_obj and user_obj.check_password(password) : 
        is_student = user_obj.is_student 
        if is_student : 
            has_exam   = user_obj.studentprofile.get_last_active_exam()
    else : 
        return HttpResponse("invalid credentials , try again",status=401)         

    if has_exam : 
        refresh = RefreshToken.for_user(user_obj)
        return HttpResponse(str(refresh.access_token)+"|"+user_obj.username,status=200)
    else : 
        return HttpResponse("Sorry"+user_obj.username+" you don't have an active exam",status=404)

@require_http_methods(["POST",])
@csrf_exempt 
def set_execution(request):
    token = request.POST.get('token')
    execution = request.POST.get('execution')
    if not(token and execution) : 
        print("no token or no execution")
        return HttpResponse("You're banned baby",status=403)
    jwt_auth = JWTAuthentication() 
    try : 
        validated_token = jwt_auth.get_validated_token(token)
    except InvalidToken : 
        return HttpResponse("invalid token",status=401)
    print("validated token :::")
    print(validated_token)
    user_obj = jwt_auth.get_user(validated_token)
    if not user_obj : 
        print("no user_obj")
        return HttpResponse("You're banned baby",status=403)   
    exam_obj = None
    is_student = user_obj.is_student 
    if is_student: 
        exam_obj = user_obj.studentprofile.get_last_active_exam()
    if not exam_obj :
        return HttpResponse("Sorry you don't have an active exam now",status=405)
    execution_expected_fields = ['Datetime','Instrument','Quantity','Price','Qty','Action','isEntry','isExit','CurrentBalance','TickValue','TickSize','Id']
    execution_format_json = {}
    execution_format_items = execution.split('|')  
    for item in execution_format_items : 
        key,value = item.split('=>')
        if not(key in execution_expected_fields) : 
            print(key)
            print("key field problem")
            return HttpResponse("You're banned",status=403)
        execution_format_json[key] = value  
    print("execution_id : "+str(execution_format_json['Id']))
    last_not_exited_trade = exam_obj.get_last_not_exited_trade(execution_format_json['Instrument'])
    last_not_exited_trade_executions = last_not_exited_trade.execution_set.all()
    if last_not_exited_trade_executions.filter(ex_id=execution_format_json['Id']).count() > 0 : 
        return HttpResponse("done",status=200)
    if(last_not_exited_trade_executions.count()>0) : 
        if int(execution_format_json['Id']) != last_not_exited_trade_executions.last().ex_id + 1 :
            last_not_exited_trade.delete()
            return HttpResponse("done",status=200)

    # for the async task give it just the execution_format_json and exam_obj.id
    handle_execution.delay(exam_obj.id,last_not_exited_trade.id,execution_format_json)
    print("done at the bottom")
    return HttpResponse("done",status=200)
    """
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
            datetime = datetime.strptime(execution_datetime,'%d/%m/%y %H:%M:%S'),
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
        last_not_exited_trade.entry_datetime =  execution_obj.datetime
        last_not_exited_trade.action = execution_obj.action 
        last_not_exited_trade.instrument = execution_obj.instrument
        last_not_exited_trade.entry_price = Decimal(execution_obj.price) 
        last_not_exited_trade.save()
    elif last_not_exited_trade.get_execution_count() > 1 and execution_obj.is_exit and last_not_exited_trade.current_position == 0  : 
        last_not_exited_trade.exit_datetime =  execution_obj.datetime
        last_not_exited_trade.exit_price = Decimal(execution_obj.price)
        exam_obj.current_balance = exam_obj.current_balance + last_not_exited_trade.pnl
        exam_obj.save()
        last_not_exited_trade.save() 
    return HttpResponse("done",status=200)
    """
    

@api_view(['POST'])
def get_dashboard(request):
    token = request.data.get('token')
    if not token : 
        return Response({"res": "You're banned"},status=status.HTTP_403_FORBIDDEN)
    jwt_auth = JWTAuthentication() 
    validated_token = jwt_auth.get_validated_token(token)
    user_obj = jwt_auth.get_user(validated_token)   
    if user_obj.is_admin : 
        exam_count = Exam.objects.count()
        on_going_exams_count = Exam.objects.filter(status="on going").count()
        in_review_exams_count = Exam.objects.filter(status="in review").count()
        certified_exams_count = Exam.objects.filter(status="succeeded").count()
        uncertified_exams_count = Exam.objects.filter(status="failed").count()
        student_count = StudentProfile.objects.count()
        dashboard_kpis = []
        dashboard_kpis.append({'description':'student','nb':student_count})
        dashboard_kpis.append({'description':'exam','nb':exam_count})
        dashboard_kpis.append({'description':'certified exams','nb':certified_exams_count})
        dashboard_kpis.append({'description':'uncertified exams','nb':uncertified_exams_count})
        dashboard_kpis.append({'description':'on going exams','nb':on_going_exams_count})
        dashboard_kpis.append({'description':'in review exams','nb':in_review_exams_count})
        return Response(dashboard_kpis,status=status.HTTP_200_OK)
    return Response({"res": "You're banned"},status=status.HTTP_403_FORBIDDEN)