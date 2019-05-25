$(document).on('click', '.delete-acc-admin', function () {
    var id = $(this).attr('id');
    $(".btn-remove-acc-admin").click(function () {
        $.ajax({
            type: "post",
            url: "/account/delete-acc-admin",
            data: { id: id }
        }).done(function (data) {
            if (data) {
                alert("Xóa tài khoản thành công!");
                window.location.reload();
            }
        })
    })

});

$(document).on('click', '.edit-role-admin', function () {
    var id = $(this).attr('id');
    var role = $('.' + id).attr('id');
    $('#check' + role).attr('checked', 'checked');

    $(".btn-set-role").click(function () {
        var check = $("input[name='role']:checked").val();
        $.ajax({
            type: "post",
            url: "/account/change-role-admin",
            data: { id: id, role: check }
        }).done(function (data) {
            if (data) {
                alert("Thiết lập quyền thành công!");
                window.location.reload();
            }
        })
    })

});

// ========detail===========
$(document).on('click', '.view-acc-admin', function () {
    var id = $(this).attr('id');
    $.ajax({
        type: "get",
        url: "/account/get-acc-detail-admin",
        data: { id: id }
    }).done(function (data) {
        if (data) {
           
            data.Items.forEach(function(i){
                var role="";
                if(i.role==1){
                    role="User";
                }
                else if(i.role==2)
                {
                    role="Member";
                }else if(i.role==3)
                {
                    role="Sub-admin";
                }else
                {
                    role="Master";
                }
                var detail = '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>ID:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += '<p>'+i.id+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>Họ & Tên:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += '<p>'+i.info.fullname+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '    <label>Quyền:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += '    <p>'+role+'</p>';
            detail += ' </div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += ' <label>Email:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += ' <p>'+i.info.email+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>Giới tính:</label>';
            detail += ' </div>';
            detail += '<div class="col col-6">';
            detail += '    <p>'+i.info.sex+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>Ngày sinh:</label>';
            detail += ' </div>';
            detail += '<div class="col col-6">';
            detail += '<p>'+i.info.birthday+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>Số điện thoại:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += '<p>'+i.info.phone+'</p>';
            detail += '</div>';
            detail += '</div>';
            detail += '<div class="row">';
            detail += '<div class="col col-4" id="lbl-detail">';
            detail += '<label>Địa chỉ:</label>';
            detail += '</div>';
            detail += '<div class="col col-6">';
            detail += '<p>'+i.info.adress+'</p>';
            detail += '</div>';
            detail += '</div>';
            $('.modal-body-detail-acc').empty();
            $('.modal-body-detail-acc').append(detail);
            })
            
            
        }
    })

})