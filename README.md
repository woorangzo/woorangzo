# woorangzo
### 1. venv 파일 생성방법
- 설정파일에 들어가 python interpreter 검색
- python interpreter 부분의 ∨ 을 눌러 show all 선택
- 좌측에 존재하는 python 삭제 후 본인의 파이썬3.10 루트로 새로 설정
- venv가 만들어진 것을 볼 수 있음
- 안 될 경우 우지연,김세환에게 오세요..

### 2. venv 설정 후
- django설치 (경로 : ..\woorangzo\venv\Scripts) <br/>
`명령어`
- pip install django==4.2.7
- python -m pip install --upgrade pip


### 가상환경
- cd venv/Scripts
- .\activate
- 가상환경 진입
- pip install -r requirements.txt 해주세요


### cmd 입력해주세요
- mysql -u root -p
- create user 'woorangzo'@'%' identified by '1234';
- grant all privileges on `*.*` to 'woorangzo'@'%';
- create database woorangzo default character set UTF8;

#### dbeaver mySql 설정(driver setting)
- useSSL  : false
- allowPublicKeyRetrieval : true
