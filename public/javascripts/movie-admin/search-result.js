var countresult=new Array();
$(document).ready(function(){
$('#btn-search-header').click((a)=>{   
    var title=$('#txtsearch').val();
    $.ajax({
        url:"/paging-search",
        type:"post",
        data:{title:title}
    }).done(function(data){
        if(data.length>0){
            countresult=data.slice(0)
        }
    })
})
$(document).on('click','.btn_add_movie_search',()=>{
    var start=parseInt($('.pagin').val()+8);
    var txtsearch=$('.btn_add_movie_search').attr('id');
    $.ajax({
        url:'/cloud-search',
        type:'post',
        data:{txtsearch:txtsearch,start:start}
    }).done((data)=>{
        console.log(data)
        var dem=0;
        if(data)
        {
            var s="";
            data.hits.hit.forEach((i) => {
            s+='<div class="col-md-3" id="line-result-search">'
            s+='<div class="single-top-movie">'
            s+='<div class="top-movie-wrap">'
            s+='<div class="top-movie-img">'
            s+='<a href="#">'
            s+='<img src="'+i.fields.posterimage+'" alt="top movies">'
            s+='</a>'
            s+='</div>'
            s+='<div class="thumb-hover">'
            s+='<a href="/detail-movie?id='+i.id+'" class="celebrity-link">Xem chi tiết</a>'
            s+='<ul>'
            s+='<a href="#" class="filmoja-btn tablet-action"><i class="fa fa-play"></i>Xem trailer</a>'
            s+='</ul>'
            s+='</div>'
            s+='</div>'
            s+='<div class="top-movie-details">'
            s+='<h4><a href="/detail-movie?id='+i.id+'">'+i.fields.title+'</a></h4>'  
            s+='</div>'
            s+='</div>'
            s+='</div>'
            dem++;
            });
            $('.no-margin-top').append(s);
            if(parseInt(start+dem)>=data.hits.found)
            {
                $('.btn_add_movie_search').attr('style','display:none')
            }
            ///$('#current-item').text(parseInt($('#current-item').text()+dem));
            var total=parseInt($('#current-item').text())+dem;
            console.log(total);
            $('#current-item').text(total);
        }
    })
})


})