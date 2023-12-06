import os
import pandas as pd
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password, make_password
import mysql.connector
from django.shortcuts import render, redirect
from matplotlib import pyplot as plt
from woorangzo import settings
from .forms import JoinForm, CustomUserUpdateForm
from django.urls import reverse
from .models import CustomUser

def custom_join(request):
    if request.method == 'POST':
        form = JoinForm(request.POST)
        if form.is_valid():
            member_data = form.cleaned_data
            if member_data['member_pw'] == member_data['member_repw']:
                # 데이터베이스에 저장
                CustomUser.objects.create(
                    username=member_data['member_id'],
                    password=make_password(member_data['member_pw']),
                    phone=member_data['phone'],
                    member_nm=member_data['member_nm'],
                    email=member_data['email'],
                    regisNum=member_data['regisNum']
                )
                # 가입이 정상적으로 완료되면 로그인 페이지로 리다이렉트
                return redirect(reverse('accounts:login'))

    else:
        form = JoinForm()

    return render(request, 'accounts/join.html', {'form': form})


def custom_login(request):
    if request.method == 'POST':
        member_id = request.POST['member_id']
        password = request.POST['password']
        user = authenticate(request, username=member_id, password=password)
        if user is not None and check_password(password, user.password):  # 비밀번호 확인 추가
            login(request, user)
            return redirect('/')
        else:
            return render(request, 'accounts/login.html', {'error': 'Invalid login credentials'})
    else:
        return render(request, 'accounts/login.html')


def custom_logout(request):
    logout(request)
    return redirect('/')


@login_required
def update_user(request):
    user = request.user
    if request.method == 'POST':
        form = CustomUserUpdateForm(request.POST, instance=user)
        if form.is_valid():
            member_pw = form.cleaned_data.get('member_pw', None)
            member_repw = form.cleaned_data.get('member_repw', None)

            if member_pw == member_repw:
                user.password = make_password(member_pw)
                user.phone = form.cleaned_data['phone']
                user.email = form.cleaned_data['email']
            user.save()

            return redirect('accounts:mypage')
    else:
        form = CustomUserUpdateForm(instance=user)

    return render(request, 'accounts/mypage.html', {'form': form})


def index(request):
    return render(request, 'accounts/index.html')


def blank(request):
    return render(request, 'accounts/blank.html')


def mypage(request):
    return render(request, 'accounts/mypage.html')


def relatedStocks(request):
    return render(request, 'accounts/relatedStocks.html')


def issue(request):
    return render(request, 'accounts/issue.html')


def stockRecommend(request):
    return render(request, 'accounts/stockRecommend.html')


def news(request):
    return render(request, 'accounts/news.html')


def analyze(request):
    return render(request, 'accounts/analyze.html')


def theme(request):
    return render(request, 'accounts/theme.html')


def calc(request):
    return render(request, 'accounts/calc.html')

def login_message_required(args):
    pass

def stock_compare(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET':
        selected_category = request.GET.get('selected_category', None)

        # MySQL 연결 설정
        mydb = mysql.connector.connect(
            host="localhost",
            user="woorangzo",
            passwd="1234",
            database="woorangzo"
        )

        # MySQL 커서 생성
        cursor = mydb.cursor()

        # 선택한 업종이 존재하는지 확인
        cursor.execute('SELECT COUNT(*) FROM category_info WHERE category_nm = %s', [selected_category])
        result = cursor.fetchone()

        if not result or result[0] == 0:
            data = {'status': 'error', 'message': '유효하지 않은 업종입니다.'}
            return JsonResponse(data)

        # 선택한 날짜에 해당하는 업종에서 상위 3개 종목 가져오기
        cursor.execute('''
            SELECT s.stock_cd, s.stock_rate, si.stock_nm, s.stock_volume, s.low_price, s.high_price
            FROM stock s
            JOIN category_info ci ON s.stock_cd = ci.stock_cd
            JOIN stock_info si ON s.stock_cd = si.stock_cd
            WHERE s.stock_dt = '2023-11-23'
            AND ci.category_nm = %s
            ORDER BY s.stock_rate DESC
            LIMIT 3;
        ''', [selected_category])
        top_stocks = cursor.fetchall()

        # 각 주식에 대한 데이터 추출
        stock_data = []
        for stock in top_stocks:
            stock_cd, stock_rate, stock_nm, stock_volume, low_price, high_price = stock
            # 각 종목에 대한 일별 등락률 데이터 가져오기
            cursor.execute('''
                SELECT stock_dt, stock_rate
                FROM stock
                WHERE stock_cd = %s
                AND stock_dt BETWEEN '2023-06-23' AND '2023-11-23'
            ''', [stock_cd])
            stock_daily_data = cursor.fetchall()
            stock_data.append({
                'stock_cd': stock_cd,
                'stock_nm': stock_nm,
                'stock_volume': stock_volume,
                'stock_rate': stock_rate,
                'low_price': low_price,
                'high_price': high_price,
                'stock_dates': [data[0] for data in stock_daily_data],
                'stock_rates': [data[1] for data in stock_daily_data],
            })

        # 그래프 생성
        fig, ax = plt.subplots()
        for stock in stock_data:
            ax.plot(stock['stock_dates'], stock['stock_rates'], label=stock['stock_nm'])

        # x축 설정: 6개의 구간으로 나누어서 표시
        date_range = pd.date_range(end='2023-11-23', periods=5, freq='M')  # 6개의 구간으로 나눔
        ax.set_xticks(date_range)
        ax.set_xticklabels([date.strftime('%Y-%m-%d') for date in date_range])

        # y축 설정: 퍼센트 단위로 표시, 간격은 10
        ax.set_yticks(range(-30, 51, 10))  # -30%부터 50%까지 10% 간격으로 설정
        ax.set_ylabel('등락률 (%)')

        ax.set_xlabel('날짜')
        ax.set_title('상위 Top 3 업종별 종목 등락률')

        ax.legend()  # 범례 추가

        # 이미지를 파일로 저장
        plot_path = os.path.join(settings.STATICFILES_DIRS[0], 'pic', 'stock_price_plot.png')
        print("Saving image to:", plot_path)
        fig.savefig(plot_path)
        plt.close()

        # 테이블에 표시할 데이터 생성
        table_data = []
        for i, stock in enumerate(stock_data, start=1):
            table_data.append({
                'rank': i,
                'stock_nm': stock['stock_nm'],
                'stock_volume': stock['stock_volume'],
                'stock_rate': stock['stock_rate'],
                'low_price': stock['low_price'],
                'high_price': stock['high_price'],
            })

        # 저장된 이미지의 URL과 테이블 데이터를 반환
        image_url = '/static/pic/stock_price_plot.png'
        data = {
            'status': 'success',
            'message': '데이터를 성공적으로 가져왔습니다.',
            'your_image': image_url,
            'stocks': table_data,
        }

        # 연결 및 커서 닫기
        cursor.close()
        mydb.close()

        return JsonResponse(data)
    else:
        data = {'status': 'error', 'message': '유효하지 않은 요청 메서드이거나 AJAX 요청이 아닙니다.'}
        return JsonResponse(data)