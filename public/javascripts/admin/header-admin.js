$(document).on('click', '.admin-logout', function () {
    $.ajax({
        url: "/account/signout",
        type: "get"
    }).done(function () {
        window.location.href = "/";
    });
});


$(document).ready(function () {
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            var member = '<ul class="nav navbar-nav left-sidebar-menu-pro">';
            member += '<li class="nav-item">';
            member += '<a href="/"><i class="fa big-icon fa-home"></i> <span class="mini-dn">Trang Chủ</span></a>';
            member += '</li>';
            member += '<li class="nav-item" ><a href="/movie/list-movie-registed" class="nav-link"><i class="fas big-icon fa-pencil-square-o"></i> <span class="mini-dn">Viết Bài</span></a>';
            member += '</li>';
            member += '<li class="nav-item" ><a href="/movie/list-movie-waiting-register-write" class="nav-link"><i class="fas big-icon fa fa-bars"></i> <span class="mini-dn">Đăng Ký BV</span></a>';
            member += '</li>';
            member += '<li class="nav-item" ><a href="/movie/list-approving-member" class="nav-link"><i class="fas big-icon fa-tasks"></i> <span class="mini-dn">BV Chờ Duyệt</span></a>';
            member += '</li>';
            member += '<li class="nav-item" ><a href="/movie/get-list-writed-member" class="nav-link"><i class="fas big-icon fa fa-list"></i> <span class="mini-dn">Danh Sách BV</span></a>';
            member += '</li>';
            member += '<li class="nav-item" ><a href="#"><i class="fas big-icon fa-user-cog"></i> <span class="mini-dn">Quản lý tài khoản</span></a>';
            member += '</li>';
            member += '</ul>';

            var subadmin = '<ul class="nav navbar-nav left-sidebar-menu-pro">';
            subadmin += '<li class="nav-item">';
            subadmin += '<a href="/"><i class="fa big-icon fa-home"></i> <span class="mini-dn">Trang Chủ</span></a>';
            subadmin += '</li> ';
            subadmin += '<li class="nav-item"> ';
            subadmin += '<a href="/movie/create-movie"><i class="fas big-icon fa-plus-square"></i> <span class="mini-dn">Tạo bài viết</span></a>';
            subadmin += '</li>';
            subadmin += '<li class="nav-item"><a href="/movie/list-movie-waiting-register-write"><i class="fas big-icon fa-list-ul"></i> <span class="mini-dn">Bài viết chờ đăng ký</span></a>';
            subadmin += '</li>';
            subadmin += '<li class="nav-item">';
            subadmin += '<a href="/movie/get-admin-approve-movie"><i class="fas big-icon fa-check-square"></i> <span class="mini-dn">Duyệt Bài</span></a>';
            subadmin += '</li>';
            subadmin += '<li class="nav-item" ><a href="/movie/get-list-movie-admin"><i class="fas big-icon fa-tasks"></i> <span class="mini-dn">Quản Lý Bài Viết</span> </a>';
            subadmin += '</li>';
            subadmin += '<li class="nav-item"><a href="#"><i class="fas big-icon fa-calendar-check"></i> <span class="mini-dn">Sự Kiện</span></a>';
            subadmin += '</li>';
            subadmin += '<li class="nav-item" ><a href="#"><i class="fas big-icon fa-user-cog"></i> <span class="mini-dn">Quản lý tài khoản</span></a>';
            subadmin += '</li>';
            subadmin += '</ul>';

            var admin = '<ul class="nav navbar-nav left-sidebar-menu-pro">';
            admin += '<li class="nav-item">';
            admin += '<a href="/"><i class="fa big-icon fa-home"></i> <span class="mini-dn">Trang Chủ</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item"> ';
            admin += '<a href="/movie/create-movie"><i class="fas big-icon fa-plus-square"></i> <span class="mini-dn">Tạo bài viết</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item"><a href="/movie/list-movie-waiting-register-write"><i class="fas big-icon fa-list-ul"></i> <span class="mini-dn">Bài viết chờ đăng ký</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item" >';
            admin += '<a href="/movie/get-admin-approve-movie"><i class="fas big-icon fa-check-square"></i> <span class="mini-dn">Duyệt Bài</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item" ><a href="/movie/get-list-movie-admin"><i class="fas big-icon fa-tasks"></i> <span class="mini-dn">Quản Lý Bài Viết</span> </a>';
            admin += '</li>';
            admin += '<li class="nav-item"><a href="#"><i class="fas big-icon fa-calendar-check"></i> <span class="mini-dn">Sự Kiện</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item" ><a href="#"><i class="fas big-icon fa-user-cog"></i> <span class="mini-dn">Quản lý tài khoản</span></a>';
            admin += '</li>';
            admin += '<li class="nav-item" ><a href="/account/admin-decentralization"><i class="fas big-icon fa-shield-alt"></i> <span class="mini-dn">Phân Quyền</span></a>';
            admin += '</li>';
            admin += '</ul>';

            var role2= '<h3>'+sess.fullname+'</h3>';
            role2+='<p>Member</p>';
            role2+='<strong>HTL</strong>';

            var role3= '<h3>'+sess.fullname+'</h3>';
            role3+='<p>Sub-Admin</p>';
            role3+='<strong>HTL</strong>';

            var role4= '<h3>'+sess.fullname+'</h3>';
            role4+='<p>Admin</p>';
            role4+='<strong>HTL</strong>';


            if (sess.role == 2) {
               $('#render-menu-by-role').empty();
               $('#render-menu-by-role').append(member);
               $('.acc').append(role2);
            }
            else if (sess.role == 3) {
                $('#render-menu-by-role').empty();
                $('#render-menu-by-role').append(subadmin);
                $('.acc').append(role3);
            }
            else {
                $('#render-menu-by-role').empty();
                $('#render-menu-by-role').append(admin);
                $('.acc').append(role4);
            }

        }
        else {
            return false;
        }
    })
});