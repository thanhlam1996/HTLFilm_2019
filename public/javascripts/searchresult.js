$(document).on('click','.item-movie-result-search',function(){
    var id=$(this).attr('id');
    var title=$("."+id).attr('id');
    // console.log(id+"=="+title)
     window.location.href="/getmovie?id="+id;  
})