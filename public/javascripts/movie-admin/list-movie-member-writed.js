
$(document).ready(function() {
    $('#example').DataTable();
} );

$(document).on('click','.open-movie-manager', function(){
    var id=$(this).attr('id');
    $.ajax({
        type: "get",
        url: "/getsession"

    }).done(function (sess) {
        if (sess) {
            if(sess.role==2)
            {
                window.location.href="/detail-movie?id="+id+"&role=mb";
            }else{
                // admin
                window.location.href="/detail-movie?id="+id+"&role=ad"; 
            }
        }
        else {
            return false;       
        }
    })
})
$(document).on('click','.open-view-movie', function(){
    var id=$(this).attr('id');
    window.open("/detail-movie?id="+id)  ;  
})