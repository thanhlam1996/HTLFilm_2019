
$(document).ready(function () {
    // $(".link-login-register").empty();
    // $(".link-login-register").append( '<li><a id="acction-login-register" href="/login-register">Đăng nhập/Đăng ký</a></li>');
    $.ajax({
        type: "get",
        url: "/getsession",
        error: function () {
            $(".link-login-register").empty();
            $(".link-login-register").append('<li><a id="acction-login-register" href="/login-register">Đăng nhập/Đăng ký</a></li>');
        }

    }).done(function (sess) {
        console.log(sess)
        if (sess.fullname) {
            
            $(".link-login-register").empty();
            $('.header-top-social').empty();
            var login = '<li>';
            login += '<div class="dropdown">';
            login += '<button type="button" id="btn-name-account-logined" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">';
            login += '<span id="daucach"> || </span>' + sess.fullname + '<span id="daucach"> ||</span>';
            login += '</button>';
            login += '<div class="dropdown-menu">';
            login += '<a class="dropdown-item" href="/get-detail-account">Quản lý tài khoản</a>';
            // login+='<a class="dropdown-item" href="/get-update-account">Cập nhật thông tin</a>';
            login += '<a class="dropdown-item signout"  href="#">Đăng xuất</a>';
            login += '</div>';
            login += '</div>';
            login += '</li>';
            var admin = "<li id='daucach'>||</li>"
            admin += '<li><a id="logined1" class="nav-member-role2" href="/pageadmin">Chuyên Trang Quản Lý</i></a></li>'
            admin += "<li id='daucach'>||</li>"
            if (sess.role >= 2) {
                $(".header-top-social").append(admin);
                $(".link-login-register").append(login);
            }
            else {
                $(".link-login-register").append(login);
            }
        }
        // // else {
        // //     // $(".link-login-register").empty();


        // // }
        // if(sess==undefined)
        // {
        //     $(".link-login-register").empty();
        //     $(".link-login-register").append( '<li><a id="acction-login-register" href="/login-register">Đăng nhập/Đăng ký</a></li>');
        //     return true;
        // }
    })
});
$(document).on('click', '.signout', function () {
    $.ajax({
        url: "account/signout",
        type: "get"
    }).done(function () {
        window.location.href = '/';
    });
});

//  live search
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#txtsearch').keyup(function () {
        //  $('#result').html('');
        //  $('#state').val('');
        var searchField = $('#txtsearch').val();

        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result').append('<li id="livesearch"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
//Subscribe
$(document).on('click', '#subscribe_submit', () => {
    var email = $('#txt_emailsubscribe').val();
    $.ajax({
        url: "/notification/check-email-subscribe",
        type: 'get',
        data: { email: email }
    }).done((isEmail) => {
        if (isEmail) {
            alert("Email " + email + " đã đăng ký theo dõi HTLFilm rồi. Hãy chọn một Email khác nhé!")
            return false; //da dky
        }
        else {
           //chua dang ky
           $.ajax({
            url: "/notification/add-subscribe-email",
            type: 'post',
            data: { email: email }
        }).done((data) => {
            console.log(data)
            if (data) {
                alert("Cảm ơn bạn đã theo dõi HTLFilm. HTLFilm sẽ luôn cập nhật phim mới đến bạn một cánh nhanh và chính xác nhất ^^!");
                window.location.href="/";
            }
            else {
                alert("Lỗi hệ thống! HTLFilm sẽ khắc phục sớm nhất. Cảm ơn bạn đã quan tâm HTLFilm");
                return false;
            }
        })
        }
    })
  
})

