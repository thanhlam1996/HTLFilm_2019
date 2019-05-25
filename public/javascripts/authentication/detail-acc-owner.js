
$(document).on('click',".change-pass",function () {
    var pass="";
    $.ajax({
        url:"/account/check-password",
        type:"get"
    }).done(function(oldpass){
        if(oldpass)
        {
            pass=oldpass;
        }
        else
        {
            return false;
        }
    })
    $('#changepass-check').change(function () {
        var oldpass=$('#changepass-check').val();
        if(oldpass==pass)
        {
            $("#erroldpass").attr('style', 'display:none; color:red');
            $("#btn-submit-changepass").removeAttr('disabled');
        }
        else
        {
            $("#erroldpass").attr('style', 'display:block; color:red');
            $("#btn-submit-changepass").attr('disabled','disabled');
        }  
    });
});


$(document).on('click','#btn-submit-changepass', function () {
    $("#frm-change-pass").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "oldpass": {
                required: true,
                minlength: 8
            },
            "newpass": {
                required: true,
                minlength: 8
            },
            "confpass": {
                required: true,
                equalTo: "#txt-newpass"
            }
        },
        messages: {
            "oldpass": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "newpass": {
                required: "Mật khẩu bắt buộc nhập",
                minlength: "Mật khẩu ít nhấp 8 ký tự"
            },
            "confpass": {
                required: "Hãy nhập lại mật khẩu",
                equalTo: "Mật khẩu không khớp"
            }
        }
    });
    if( $("#frm-change-pass").valid()){
        var _newpass=$("#txt-newpass").val();
        $.ajax({
            url:"/account/change-password",
            type:"post",
            data:{
                newpass:_newpass
            }
        }).done((data)=>{
            if(data)
            {
                $.ajax({
                    url: "account/signout",
                    type: "get"
                }).done(function () {
                    alert("Đổi mật khẩu thành công. Bạn hãy đăng nhập lại để tiếp túc trải nghiệm nhé!")
                    window.location.href="/";
                });
            }else{
                alert("Lỗi máy chủ. Hãy thử lại sau ít phút!");
                return false;
            }
        })
    }
    else
    {
       return false;
    }
});
$(document).on('click','.update-acc-all', function () {
    $("#frm-update-acc").validate({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        rules: {
            "fullname": {
                required: true
               
            },
            "birthday": {
                required: true
               
            },
            "phone": {
                required: true
               
            },
            "adress": {
                required: true
              
            }
        },
        messages: {
            "fullname": {
                required: "Họ và tên bắt buộc nhập"
                
            },
            "birthday": {
                required: "Ngày sinh bắt buộc nhập"
                
            },
            "phone": {
                required: "Số điện thoại bắt buộc nhập"
                
            },
            "adress": {
                required: "Địa chỉ bắt buộc nhập"
               
            }
        }
    });
    $('#btn-submit-update-acc').click(()=>{
        if( $("#frm-update-acc").valid()){
            var _fullname=$('#txt-reg-fullname').val();
            var _birthday=$('#txt-birthday').val();
            var _sex=$('input[name="sex"]:checked').val();
            var _phone=$('#txt-reg-phone').val();
            var _adress=$('#txt-reg-adpress').val();
            $.ajax({
                url:"/account/update-acc",
                type:"post",
                data:{
                    fullname:_fullname,
                    birthday:_birthday,
                    sex:_sex,
                    phone:_phone,
                    adress:_adress
                }
            }).done((data)=>{
                if(data)
                {
                   alert("Cập nhật thông tin thành công!");
                   window.location.href='/get-detail-account';
                }else{
                    alert("Lỗi máy chủ. Hãy thử lại sau ít phút!");
                    return false;
                }
            })
        }
        else
        {
           return false;
        }
    })
    
});
// $(document).on('click','#btn-submit-update-acc',()=>{
   
// })