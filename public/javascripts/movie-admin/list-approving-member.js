$(document).on('click', '.btn-view-post-member', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    // var title=$('.'+id).attr('id');
    window.location.href="/detail-movie?id="+id+"&role=mb";        
});
$(document).on('click', '.btn-edit-post-member', function(){
    var id=$("."+$(this).attr('id')).attr('id');
    // var title=$('.'+id).attr('id');
    window.location.href="/movie/get-update-movie-member?id="+id;      
});