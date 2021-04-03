import json
import requests
import datetime
import pytz

# Doliot api endpoints
hostname = 'http://127.0.0.1:8000/api'
token_end_point = hostname+'/token/'
ongoing_exams_end_point = hostname+'/exam/get_ongoing/'
set_exams_expired = hostname+"/exam/set_exams_expired/"
# Authentication
credential = {'email':'admin@gmail.com',
               'password':'iloveyou'}
headers = {'Content-Type':'application/json'}
r = requests.post(token_end_point,data=json.dumps(credential),headers=headers)
print(r.json()['access'])

token = r.json()['access']
headers = {'Content-Type':'application/json',
           'Authorization':'Bearer '+token}

r = requests.get(ongoing_exams_end_point,headers=headers)
print(r.json())
exams = r.json()
utc=pytz.UTC
if len(exams) > 0 : 
    expired_exams_ids  = []
    for exam in exams : 
        exam_datetime = datetime.datetime.strptime(exam["end_at"],"%Y-%m-%dT%H:%M:%SZ").astimezone(pytz.utc)
        current_datetime = datetime.datetime.now().astimezone(pytz.utc)
        if current_datetime >= exam_datetime : 
            expired_exams_ids.append(exam['id'])
    print(expired_exams_ids)
    if len(expired_exams_ids) >  0 : 
        r = requests.put(set_exams_expired,data=json.dumps({'exams_id':expired_exams_ids}),headers=headers)
        print("id => {exam_id} / end_at => {end_at}".format(exam_id=exam['id'],end_at=exam['end_at']))