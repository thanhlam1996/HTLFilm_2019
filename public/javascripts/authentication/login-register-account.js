// ==========Validate Form Register==================
$(document).ready(function () {
    $("#frmregister").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "email": {
                required: true,
                email: true
            },
            "fullname": {
                required: true

            },
            "password": {
                required: true,
                minlength: 8
            },
            "confirmpassword": {
                required: true,
                equalTo: "#txt-reg-password"
            },
            "phone": {
                required: true
            },
            "adress": {
                required: true
            }
        },
        messages: {
            "email": {
                required: "Email không hợp lệ",
                email: "Email bắt buộc nhập"
            },
            "fullname": {
                required: "Họ và tên bắt buộc nhập"
            },
            "password": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "confirmpassword": {
                required: "Hãy nhập lại mật khẩu",
                equalTo: "Mật khẩu không khớp"
            },
            "phone": {
                required: "Số điện thoại bắt buộc nhập"
            },
            "adress": {
                required: "Địa chỉ bắt buộc nhập"
            }

        }
    });
});
$(document).ready(function () {
    $(".frm-login").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "email": {
                required: true,
                email: true
            },
            "password": {
                required: true,
                minlength: 8
            }
        },
        messages: {
            "email": {
                required: "Email không hợp lệ",
                email: "Email bắt buộc nhập"
            },
            "password": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            }
        }
    });
});
// ========End Validate From Register================
$(document).ready(function(){    
	$('#datepicker').datepicker({
		dateFormat: 'dd/mm/yy',
		showMonthAfterYear: true,
		yearSuffix: '',
		dayNamesMin: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
		monthNames: ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'],
	});
})


$(document).ready(function () {
    $('#txt-reg-phone').change(function () {
		// console.log("ok");
        if (checkPhoneNumber()) {
            $(".errphone").attr('style', 'display:none; color:red');
            return true;
        }
        else {
			$(".errphone").attr('style', 'display:block; color:red');
            return false;
        }
    });
});

// ==========Check Phone========================
function checkPhoneNumber() {
    var flag = false;
    var phone = $('#txt-reg-phone').val().trim(); // ID của trường Số điện thoại
    phone = phone.replace('(+84)', '0');
    phone = phone.replace('+84', '0');
    phone = phone.replace('0084', '0');
    phone = phone.replace(/ /g, '');
    if (phone != '') {
        var firstNumber = phone.substring(0, 2);
        if ((firstNumber == '09' || firstNumber == '08' || firstNumber == '07' || firstNumber == '03' || firstNumber == '05') && phone.length == 10) {
            if (phone.match(/^\d{10}/)) {
                flag = true;
            }
            else {
                flag = false;
            }
        }
        return flag;
    }
}

// ========== End Check Phone========================

// ==========Check Email=============================
$(document).ready(function () {
    $("#txt-reg-email").change(function () {
        var _email = $("#txt-reg-email").val();
        $.ajax({
            url: "account/checkemail",
            data: {
                "email": _email
            },
            type: 'get'

        }).done(function (data) {
            console.log(data)
            if (data) {
                $(".errreg").attr('style', 'display:none; color:red');
                $('#btn-register').prop('disabled', false);
                return false;
            }
            else {
                $(".errreg").attr('style', 'display:block; color:red');
                $('#btn-register').prop('disabled', true);
                return true;
            }
        });
    });
});
// =========End Check Email==========================