
$(document).on('click', '.app-admin', function(){
    var id=$(this).attr('id')
    $.ajax({
        type: "post",
        url:  "/movie/admin-approve-movie",
        data: {id:id}
    }).done(function(data){
        if(data)
        {
            alert("Duyệt bài thành công!");
            window.location.reload();
        }
        else
        {
            return false;
        }
    })
});
$(document).on('click','.admin-edit-movie-content', function(){
    var id=$(this).attr('id');
    console.log(id)
    window.location.href="/movie/get-update-movie-admin?id="+id;    
})
$(document).on('click', '.btn-remove-admin', function(){
    var id=$(this).attr('id');
    $(".btn-remove-approve").click(function(){
        $.ajax({
            type: "post",
            url:  "/movie/delete-movie-admin",
            data: {id:id}
        }).done(function(data){
            if(data)
            {
                alert("Xóa bài thành công!");
                window.location.reload();
            }
        })
    })
    
});

$(document).on('click', '.admin-unapprove', function(){
    var id=$(this).attr('id');
    $(".btn-unapprove-note").click(function(){
        var note=$(".txt-unapprove-note").val();
        $.ajax({
            type: "post",
            url:  "/movie/unapprove-movie-admin",
            data: {id:id,note:note}
        }).done(function(data){
            if(data)
            {
                alert("Không duyệt bài thành công!");
                window.location.reload();
            }
        })
    })
    
});


$(document).on('click', '.admin-edit', function () {
    var id=$(this).attr('id');
    window.location.href="/movie/update-movie-admin?id="+id;
});
