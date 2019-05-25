$(document).ready(function () {

    var d = new Date();
    $("#day").val(d.getDate());
    $("#month").val(d.getUTCMonth() + 1);
    $("#year").val(d.getFullYear());

});

function Checkdate() {
    var d = new Date();
    var day = $("#day").val();
    var month = $("#month").val();
    var year = $("#year").val();
    if (year > $("#year").val(d.getFullYear())) {
        return false;
    } else {
        if (month == 2) {
            if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
                if (day <= 29) {

                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (day <= 28) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        else {
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                if (day <= 31) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                if (day <= 30) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
}

// Check Phone number
function checkPhoneNumber() {
    var flag = false;
    var phone = $('#phonereg').val().trim(); // ID của trường Số điện thoại
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

$(document).ready(function () {
    $('#phonereg').change(function () {
        if (checkPhoneNumber()) {
            $("#errphone").attr('style', 'display:none; color:red');
            return true;
        }
        else {
            $("#errphone").attr('style', 'display:block; color:red');
            return false;
        }
    });
});
// ====================

$(document).on("click", ".btn-submit-register-account", function () {
    if (Checkdate() == false) {
        alert("Ngày tháng năm sinh không hợp lệ");
        return false;
    }
});
// =======Check Email========

$(document).ready(function () {
    $("#reg-email").change(function () {
        var _email = $("#reg-email").val();
        $.ajax({
            url: "account/checkemail",
            data: {
                "email": _email
            },
            type: 'get'

        }).done(function (data) {
            console.log(data)
            if (data) {
                $("#err-reg").attr('style', 'display:none; color:red');
                $('.btn-submit-register-account').prop('disabled', false);
                return false;
            }
            else {
                $("#err-reg").attr('style', 'display:block; color:red');
                $('.btn-submit-register-account').prop('disabled', true);
                return true;
            }
        });
    });
});
// ==========End check email===
$(document).ready(function () {
    $("#form-register-account").validate({
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
                equalTo: "#loginpassword"
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
    $("#frm-login-dialog").validate({
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

