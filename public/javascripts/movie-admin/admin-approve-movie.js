$(document).on('click', '.btn-approve', function(){
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
    })
});
// Unapprove
$(document).on('click', '.btn-unapprove', function(){
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
// Delete
$(document).on('click', '.btn-remove-approve', function(){
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
$(document).on('click', '.btn-view-post-admin', function(){
    var id=$(this).attr('id');
    window.location.href="/detail-movie?id="+id+"&role=ad";    
});