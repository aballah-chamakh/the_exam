import os

# ecnter directory name

requirements = {
'django':'django==3.0',
'DRF':'djangorestframework',
'jwt':'djangorestframework-jwt',
'cors':'django-cors-headers',
#'channels':'channels',
}

for k,v in requirements.items() :
    os.system('pip install {module}'.format(module=v))
    print("package "+v+" done !! ")

print("create the django app !!")
os.chdir("./src/Backend")
os.system('django-admin startproject MkExam')
