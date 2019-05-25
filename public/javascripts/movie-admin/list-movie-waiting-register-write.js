
$(document).on('click', '.btnregistionmovie', function () {
    var id=$('.'+$(this).attr('id')).attr('id');
    var title=$("."+id).attr('id');

    $.ajax({
        type: "post",
        url:  "/movie/member-register-movie",
        data: {id:id, title:title}
    }).done(function(data){
        if(data)
        {
            alert("Đăng ký thành công!");
            window.location.reload();
        }
    })
});
$(document).on('click', '.btn-edit-movie-waiting', function () {
    var id=$(this).attr('id');
    window.location.href="/movie/update-movie-admin?id="+id;
});

$(document).on('click','.btn-delete-movie-waiting', function(){
    var id=$(this).attr('id');
    console.log(id)
    $("#btn-delete-movie-waiting").click(function(){
        $.ajax({
            type: "post",
            url:  "/movie/delete-create-movie-admin",
            data: {id:id}
        }).done(function(data){
            if(data)
            {
                alert("Xóa bài thành công!");
                window.location.reload();
            }
        })
    })
    
})
