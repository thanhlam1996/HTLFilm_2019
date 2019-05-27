
$(document).on('click', '.btn_add-listmovie', () => {
    var index = $('#current-list-movie').text();
    var total = $('.sizelistmovie').attr('id');
    var last = parseInt(index) + 10;
    var url = $(this).attr('id');
    $.ajax({
        type: 'GET',
        url: url,
        data: {
            index: index,
            last: last
        }
    }).done((movie) => {
        if (movie) {
            var s = "";
            var dem=0;
            movie.forEach((i) => {
                var rat = 0, rating = 0
                var countrat = 0
                if (i.ratings) {
                    i.ratings.forEach((r) => {
                        rat += parseFloat(r);
                        countrat++
                    })
                    if (countrat == 0) {
                        countrat = 1;
                    }
                    var num = (rat / countrat).toFixed(1)
                    if ((num * 10) % 10 == 0) {
                        rating = (rat / countrat).toFixed(0)
                    } else {
                        rating = (rat / countrat).toFixed(1)
                    }
                }

                s += '<div class="col-md-3" id="line-result-search">'
                s += '<div class="single-top-movie">'
                s += '<div class="top-movie-wrap">'
                s += '<div class="top-movie-img">'
                s += '<a href="#">'
                s += '<img src='+i.info.posterimage+' alt="top movies">'
                s += '</a>'
                s += '</div>'
                s += '<div class="thumb-hover">'
                s += '<a href="/detail-movie?id='+i.id+'" class="celebrity-link">Xem chi tiết</a>'
                s += '<ul>'
                s += '<a href="#" class="filmoja-btn tablet-action"><i class="fa fa-play"></i>Xem trailer</a>'
                s += '</ul>'
                s += '</div>'
                s += '</div>'
                s += '<div class="top-movie-details">'
               if(i.title.length>22){
                s += '<h4><a href="/detail-movie?id='+i.id+'">'+i.title+'</a></h4>'
                }else{
                s += '<h4><a href="/detail-movie?id='+i.id+'">'+i.title+'</a></h4></br>'
                }
                s += '</div>'
                s += '<div class="movie-details-thumbs">'
                s += '<ul>'
                s += '<li>'
                s += '<a href="#"><i class="fa fa-thumbs-up"></i>'
                if(i.countlike)
                {
                    s += ''+i.countlike+'</a>'
                }
                else
                {
                    i.countlike=0;
                    s += ''+i.countlike+'</a>'
                }
                
                s += '</li>'
                s += '<li>'
                if(i.movieview)
                {
                    s += '<a href="#"><i class="fa fa-eye"></i>'+i.movieview+'</a>'
                }
                else
                {
                    i.movieview=0;
                    s += '<a href="#"><i class="fa fa-eye"></i>'+i.movieview+'</a>'
                }
                s += '</li>'
                s += '<li>'
                s += '<a href="#"><span class="rating"><i class="fa fa-star"></i>'+rating+'</span></a>'
                s += '</li>'
                s += '</ul>'
                s += '</div>'
                s += '</div>'
                s += '</div>'
                dem++;
            })
            $('.no-margin-top').append(s);
            if((parseInt(index)+dem)>=total)
            {
                $('.btn_add-listmovie').attr('style','display:none');
            }
            $('#current-list-movie').text((parseInt(index)+dem))
        }
        else {

        }
    })
})



// $(window).scroll(function () {
//     if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
//         var keysearch = $("#txtsearch").val();
//         var lastevaluatedkey = JSON.parse($(".titlelast").val());
//         $.ajax({
//             type: 'GET',
//             url: "/search",
//             data: {
//                 "carname": keysearch,
//                 lastevaluatedkey
//             }
//         }).done(function (data) {
//             if (data.Count > 0) {
//                 data.Items.forEach(function (i) {

//                     var s = '';
//                     s += '<div class="container" id="containerbody">';
//                     s += '<div class="itemcar">';
//                     s += '<div class="item">';
//                     s += '<span class="img">';
//                     s += '<img src="backgroud.jpg" alt="">';
//                     s += '</span>';
//                     s += '<span class="descripttext">';
//                     s += '<div class="txttitle">';
//                     s += '<a href="#" class="carname">' + i.carname + "-" + i.version + '</a>';
//                     s += '</div>';
//                     s += '<div class="contentcar">';
//                     s += '<p class="descar">';
//                     s += 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur porro, sunt totam deserunt qui voluptatum eveniet suscipit, explicabo velit repudiandae perspiciatis pariatur incidunt numquam quas aut iste temporibus a delectus!';
//                     s += '</p>';
//                     s += '</div>';
//                     s += '</span>';
//                     s += '</div>';
//                     s += '<hr>';
//                     s += '</div>';
//                     s += '</div>';
//                     $("#loadnext").append(s);
//                 })
//             }

//             if (data.LastEvaluatedKey) {
//                 $(".titlelast").remove();
//                 $("#pagenext").append('<button class="titlelast" value=' + JSON.stringify(data.LastEvaluatedKey) + '>Cuộn xuống để xem thêm</button>');
//             }
//             else {

//                 $(".titlelast").remove();
//                 $("#pagenext").append('<label  id="btnback">End</label>');
//                 $(window).off("scroll", scrollHandler);
//             }
//         });
//     }
// });