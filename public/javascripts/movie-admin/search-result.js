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
$(document).on('click','#next',()=>{
    console.log(countresult.length)
})

$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
        // var keysearch = $("#txtsearch").val();
        // var lastevaluatedkey = JSON.parse($(".titlelast").val());
        // $.ajax({
        //     type: 'GET',
        //     url: "/search",
        //     data: {
        //         "carname": keysearch,
        //         lastevaluatedkey
        //     }
        // }).done(function (data) {
        //     if (data.Count > 0) {
        //         data.Items.forEach(function (i) {

                   
        //         })
        //     }

        //     if (data.LastEvaluatedKey) {
        //         $(".titlelast").remove();
        //         $("#pagenext").append('<button class="titlelast" value=' + JSON.stringify(data.LastEvaluatedKey) + '>Cuộn xuống để xem thêm</button>');
        //     }
        //     else {

        //         $(".titlelast").remove();
        //         $("#pagenext").append('<label  id="btnback">End</label>');
        //         $(window).off("scroll", scrollHandler);
        //     }
        // });
        console.log("Toi roi")
        $( window ).off( 'scroll', ScrollHandler ).on( 'scroll', ScrollHandler );
    }

});




})