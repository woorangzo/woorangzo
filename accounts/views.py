from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import auth

# Create your views here.
def join(request):
    if request.method == "POST":
        username = request.POST['username']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        if password1 == password2:
            # Check if the username is unique
            if User.objects.filter(username=username).exists():
                return render(request, 'accounts/join.html', {'error': '이미 존재하는 사용자명입니다.'})

            # Create a new user
            user = User.objects.create_user(username, password=password1)
            auth.login(request, user)
            return redirect('home')
        else:
            return render(request, 'accounts/join.html', {'error': '비밀번호가 일치하지 않습니다.'})

    return render(request, 'accounts/join.html')

def login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(request, username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('home')
        else:
            return render(request,'accounts/login.html', {'error':'username or password is incorrect'})
    else:
        return render(request,'accounts/login.html')

def logout(request):
    if request.method == "POST":
        auth.logout(request)
        return redirect('home')
    return render(request,'accouts/join.html')
