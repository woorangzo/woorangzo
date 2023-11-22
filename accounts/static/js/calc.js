$(document).on('click', '.Calculator .tab-st01-02 > li', function () {
        console.log('click');
        var panIdx = $(this).index();
        $(this).addClass('selected');
        $(this).siblings().removeClass('selected');
        $('.Calculator .tab-body > div').hide();
        $('.Calculator .tab-body > div').eq(panIdx).show();
        return false;
    });

    function closeInvestCalculatorLayer() {
        window.close();
        console.log('closeInvestCalculatorLayer');
        // if( $('html').hasClass('desktop') || $('html').hasClass('tablet') )
        // {
        // 	window.close();
        // }
        // else
        // {
        // 	$('.pop-layer').hide();
        // }
    };

    (function () {
        console.log('ready function');
        clear();    // 초기화(새로고침) 버튼 기능
        $('input[name = Now_Price], input[name = Have_Price], input[name = Have_Stock], input[name = Add_Price],input[name = Add_Stock]').on('input', function (event) {
            console.log('beautifyNumber');
            console.log('beautifyNumber');
            beautifyNumber(this.name);  // input 값 다듬기
            console.log('바뀌는 것의 이름: ' + this.name);
            console.log('눌리는 키 이름: ' + event.keyCode);
            calAvgPrice();  // 평단가 계산
        });
        $('input[name = Buy_Price], input[name = Sell_Stock], input[name = Sell_Price], input[name = Fee]').on('input', function () {
            beautifyNumber(this.name);  // input 값 다듬기
            calBenefitRate();   // 수익률 계산
        });
    })();


    var calAvgPrice = function () {
        console.log('calAvgPrice');
        if ($('input[name = Now_Price]').val() != '' && $('input[name = Have_Price]').val() != '' && $('input[name = Have_Stock]').val() != '' && $('input[name = Add_Price]').val() != '' && $('input[name = Add_Stock]').val() != '') {
            var Total_Stock_Cnt = uncomma($('input[name=Add_Stock]').val()) * 1 + uncomma($('input[name=Have_Stock]').val()) * 1;
            var Total_Now_Stock_Price = uncomma($('input[name=Have_Price]').val()) * uncomma($('input[name=Have_Stock]').val()) * 1;
            var Total_Add_Stock_Price = uncomma($('input[name=Add_Price]').val()) * uncomma($('input[name=Add_Stock]').val()) * 1;
            var Total_Avg_Price = Math.round((Total_Now_Stock_Price + Total_Add_Stock_Price) / Total_Stock_Cnt);

            putValueByID(isNaN(Total_Avg_Price) ? 0 : Total_Avg_Price, '#Cal_Avg_Price');  // 평단가

            var Korean_Small_Avg = 0;
            var Chg_Total_Avg_Price = Total_Avg_Price;
            Chg_Total_Avg_Price = Math.round(Chg_Total_Avg_Price);
            if (Math.floor(Chg_Total_Avg_Price * 1 / 10000) != 0) {
                Korean_Small_Avg = Math.floor(Chg_Total_Avg_Price * 1 / 10000) + '만 ' + Chg_Total_Avg_Price % 10000 + ' 원';
            } else {
                Korean_Small_Avg = Chg_Total_Avg_Price % 10000 + ' 원';
            }
            $('#Small_Cal_Avg_Price').empty();
            $('#Small_Cal_Avg_Price').append(Korean_Small_Avg == 'NaN만 NaN 원' ? '0 원' : Korean_Small_Avg);   // 작은 평단가

            $('#Cal_Count').empty();
            $('#Cal_Count').append(Math.round(Total_Stock_Cnt).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' 주');
            putValueByID(Total_Now_Stock_Price + Total_Add_Stock_Price, '#Cal_Buy_Price');  // 매수금액

            var Cal_Benefit = (uncomma($('input[name=Now_Price]').val()) * 1 - Total_Avg_Price * 1) * Total_Stock_Cnt;  // 손익
            $('#Cal_Profit').empty();
            setColor(isNaN(Cal_Benefit) ? 0 : Cal_Benefit, 'Cal_Profit');
            Cal_Benefit = comma(Math.round(isNaN(Cal_Benefit) ? 0 : Cal_Benefit).toString());
            $('#Cal_Profit').append(Cal_Benefit + ' 원');

            var Benefit_Percent = (uncomma($('input[name=Now_Price]').val()) / Total_Avg_Price - 1) * 100;  // 수익률

            $('#Cal_Yield').empty();
            $('#Cal_Yield').append(isNaN(Benefit_Percent.toFixed(2)) ? '0 %' : Benefit_Percent.toFixed(2) + ' %');
            setColor(Benefit_Percent, 'Cal_Yield');
        }
    }

    var calBenefitRate = function () {
        console.log('calBenefitRate');
        const PERCENT = 0.01;

        var Trade_Fee_Percent = 0.015 * PERCENT; // 기본 수수료

        if ($('input[name = Fee]').val() != '' && $('input[name = Fee]').val() != null) {
            Trade_Fee_Percent = uncomma($('input[name = Fee]').val()) * 0.01;
        }
        if ($('input[name = Buy_Price]').val() != '' && $('input[name = Sell_Stock]').val() != '' && $('input[name = Sell_Price]').val() != '') {
            var Buy_Price = uncomma($('input[name = Buy_Price]').val()) * uncomma($('input[name = Sell_Stock]').val()) * 1; // 매수금액
            putValueByID(Buy_Price, '#Buy_Price');

            var Sel_Price = uncomma($('input[name = Sell_Price]').val()) * uncomma($('input[name = Sell_Stock]').val()) * 1; // 매도 금액
            putValueByID(Sel_Price, '#Sell_Price');

            var Total_Trade_Fee = Buy_Price * Trade_Fee_Percent + Sel_Price * Trade_Fee_Percent; // 수수료
            putValueByID(Total_Trade_Fee, '#Fee');

            var Trade_Tax = Sel_Price * 0.23 * PERCENT; // 거래세
            putValueByID(Trade_Tax, '#Trade_Tax');

            var Benefit = Sel_Price - Total_Trade_Fee - Trade_Tax - Buy_Price;  // 큰 손익
            putValueByID(Benefit, '#Benfit_Loss');
            setColor(Benefit, 'Benfit_Loss');

            var Korean_Small_Avg = '';  // 작은 평단가 -> 한글 치환
            var Chg_Benefit = Benefit;
            Chg_Benefit = Math.round(Chg_Benefit);
            if (Chg_Benefit * 1 >= 0) {
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 1000000000000) != 0 ? Math.floor(Chg_Benefit * 1 / 1000000000000) + '조 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 1000000000000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 100000000) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 100000000) + '억 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 100000000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 10000) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 10000) + '만 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 10000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 1) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 1) + '원' : Korean_Small_Avg + '원';
            } else {
                Chg_Benefit = Chg_Benefit * -1;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 1000000000000) != 0 ? Math.floor(Chg_Benefit * 1 / 1000000000000) + '조 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 1000000000000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 100000000) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 100000000) + '억 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 100000000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 10000) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 10000) + '만 ' : Korean_Small_Avg;
                Chg_Benefit = Chg_Benefit % 10000;
                Korean_Small_Avg = Math.floor(Chg_Benefit * 1 / 1) != 0 ? Korean_Small_Avg + Math.floor(Chg_Benefit * 1 / 1) + '원' : '-' + Korean_Small_Avg + '원';
            }

            $('#Small_Benefit_Loss').empty();
            $('#Small_Benefit_Loss').append(Korean_Small_Avg == '원' ? '0 원' : Korean_Small_Avg);   // 작은 평단가

            setColor(Benefit, 'Small_Benefit_Loss');

            var Benefit_Rate = (((Sel_Price - Total_Trade_Fee - Trade_Tax) / Buy_Price) - 1) * 100; // 수익률
            $('#Benfit_Rate').empty();
            $('#Benfit_Rate').append(isNaN((Math.round(Benefit_Rate * 100) / 100).toString()) ? '0 %' : (Math.round(Benefit_Rate * 100) / 100).toString() + ' %');
            setColor(Benefit_Rate, 'Benfit_Rate');
        }
    }

    var beautifyNumber = function (Input_Name) {
        console.log('beautifyNumber');
        var LIMIT_NUM = 8;
        if (Input_Name != '') {
            var name = 'input[name = ' + Input_Name + ']';
            $(name).val($(name).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));  // 문자를 입력한 경우
            if ($(name).val().substr(0, 1) == '0') {  // 맨 앞자리가 0으로 시작하는 경우
                if ($(name).val().substr(1, 1) != '.') {
                    $(name).val($(name).val() * 1);
                }
            }
            if (Input_Name != 'Have_Stock' && Input_Name != 'Add_Stock' && Input_Name != 'Sell_Stock' && Input_Name != 'Fee') {  // 수량과 수수료를 제외하고 .을 허용하지 않는다.
                $(name).val($(name).val().replace('.', ''));
                if ($(name).val() == 0) { // 수량과 수수료를 제외하고 0을 허용하지 않는다.
                    $(name).val('');
                }
            } else {
                if ($(name).val() == '.') {
                    $(name).val($(name).val().replace('.', ''));
                }
            }

            if ($(name).val().length > LIMIT_NUM) {  // 지정된 숫자의 범위를 넘었을 경우
                if ($(name).val().indexOf('.') != -1) {  // 만약 숫자가 소수점 (.)을 포함하고 있으면
                    if (Input_Name == 'Fee') {      // 증권사 수수료의 경우 최대값 9.9999999
                        LIMIT_NUM = 9;
                        $(name).val($(name).val().substr(0, LIMIT_NUM));
                        if ($(name).val().split('.')[1].length > 7) {
                            $(name).val($(name).val().substring(0, $(name).val().length - 1));
                        }
                    } else {
                        LIMIT_NUM = 11;
                        $(name).val($(name).val().substr(0, LIMIT_NUM));
                        if ($(name).val().split('.')[1].length > 2) {
                            $(name).val($(name).val().substring(0, $(name).val().length - 1));
                        }
                    }
                } else {    // 숫자가 소수점 (.)을 포함하지 않으면
                    $(name).val($(name).val().substr(0, LIMIT_NUM));
                }
            } else {    // 지정된 숫자 범위를 넘지 않았을 경우
                if ($(name).val().indexOf('.') != -1) {   // 소수점이 포함된 경우
                    if (Input_Name == 'Fee') {  // 증권사 수수료의 경우 최대값 9.9999999
                        LIMIT_NUM = 9;
                        $(name).val($(name).val().substr(0, LIMIT_NUM));
                        if ($(name).val().split('.')[1].length > 7) {
                            $(name).val($(name).val().substring(0, $(name).val().length - 1));
                        }
                    } else if ($(name).val().split('.')[1].length > 2) {
                        $(name).val($(name).val().substring(0, $(name).val().length - 1));
                    }
                } else {    // 소수점이 포함되지 않은 경우
                    if (Input_Name == 'Fee') {  // 증권사 수수료의 경우 최대값 9.9999999
                        LIMIT_NUM = 1;
                        $(name).val($(name).val().substr(0, LIMIT_NUM));
                    }
                }
            }
            inputNumberFormat($(name));
        }
    }

    var inputNumberFormat = function (obj) {   // input 창에 콤마 삽입
        console.log('inputNumberFormat');
        if (String(obj.val()).indexOf('.') != '-1') {  // 만일 소숫점이 3자리를 넘어가면 , 가 삽입되므로 이를 방지하기 위해 케이스를 나눈다.
            var integerObj = Math.floor(uncomma(obj.val()) * 1);   // 양의 정수
            var modifyNumber = comma(integerObj) + '.' + String(obj.val()).split('.')[1];  // 양의 정수 + 소숫점
            obj.val(modifyNumber);
        } else {
            obj.val(comma(uncomma(obj.val())));
        }
    }

    var comma = function (str) {   // 천 단위 콤마 삽입
        console.log('comma');
        str = String(str);
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var uncomma = function (str) { // 콤마 제거
        console.log('uncomma');
        str = String(str);
        while (str.indexOf(',') != -1) {
            str = str.replace(',', '');
        }
        return str;
    }

    var setColor = function (obj, id) {    // 금액에 따른 글자 색상 지정
        console.log('setColor');
        var num = obj * 1;
        if (num < 0) {
            document.getElementById(id).style.color = '#1ea3fe';
        } else if (num > 0) {
            document.getElementById(id).style.color = '#ff545b';
        } else {
            document.getElementById(id).style.color = '#000';
        }
    }

    var putValueByID = function (obj, id) {    // 숫자 원 단위로 치환
        console.log('putValueByID');
        $(id).empty();
        $(id).append(comma(Math.round(obj * 1).toString()) + ' 원');
    }


    function clear() {  // 초기화 기능
        console.log('clear');
        $('img[alt=새로고침]').click(function () {
            console.log('새로고침');
            if ($(".tab-st01-02 .selected a").text() === '평단가계산') {
                console.log('평단가계산');
                $('input[name = Now_Price]').val('');
                $('input[name = Have_Price]').val('');
                $('input[name = Have_Stock]').val('');
                $('input[name = Add_Price]').val('');
                $('input[name = Add_Stock]').val('');

                $('#Cal_Avg_Price').text('원');
                $('#Small_Cal_Avg_Price').text('주');
                $('#Cal_Count').text('원');
                $('#Cal_Buy_Price').text('원');
                $('input[name=Now_Price]').text('원');
                $('#Cal_Profit').text('원');
                $('#Cal_Profit').css('color', '#000');
                $('#Cal_Yield').text('%');
                $('#Cal_Yield').css('color', '#000');
            }
            if ($(".tab-st01-02 .selected a").text() === '수익률계산') {
                console.log('수익률계산');
                $('input[name = Buy_Price]').val('');
                $('input[name = Sell_Stock]').val('');
                $('input[name = Sell_Price]').val('');
                $('input[name = Fee]').val('');

                $('#Benfit_Loss').text('원');
                $('#Benfit_Loss').css('color', '#000');
                $('#Small_Benefit_Loss').text('원');
                $('#Small_Benefit_Loss').css('color', '#000');
                $('#Benfit_Rate').text('%');
                $('#Benfit_Rate').css('color', '#000');
                $('#Buy_Price').text('%');
                $('#Sell_Price').text('원');
                $('#Fee').text('원');
                $('#Trade_Tax').text('원');

            }
        });
    }