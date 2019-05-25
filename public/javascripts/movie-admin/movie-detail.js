$(document).on('click', '#btn-back-admin-and-member', function () {
    window.history.back();
})
$(document).on('click', '.btn-admin-approve', function () {
    var _title = $(this).attr('id');
    var _id = $('.movie-details-page-box').attr('id');
    $.ajax({
        url: "/movie/admin-approve-movie",
        type: 'post',
        data: { title: _title, id: _id }
    }).done(function (data) {
        if (data) {
            alert("Bài " + _title + " được duyệt thành công!");
            window.location.href = "/movie/get-admin-approve-movie"
        }
        else {
            return false;
        }
    })

})
$(document).on('click', '.btn-admin-edit', function () {
    var _id = $('.movie-details-page-box').attr('id');
    window.location.href = "/movie/get-update-movie-member?id=" + _id;
})
$(document).on('click', '.btn-cmt', () => {
    var id = $('.btn-cmt').attr('id');
    var content_cmt = $('.txt-content-cmt').val();
    var rating = $("input[name='rating']:checked").val();

    $.ajax({
        url: "/movie/comment-movie",
        type: "POST",
        data: {
            content_cmt: content_cmt,
            id: id,
            rating: rating
        }
    }).done((data) => {
        if (data) {
            window.location.reload();
        }
        else {
            return false;
        }
    })
})
$(document).on('click', '.like', () => {
    var id = $('.like').attr('id');
    $.ajax({
        type: "post",
        url: "/movie/like-movie",
        data: { id: id }
    }).done((data) => {
        if (data) {
            window.location.reload();
        }
        else {
            return false;
        }
    })
});
$(document).on('click', '.dislike', () => {
    var id = $('.dislike').attr('id');
    var index=$('.dislike-index').attr('id');
    $.ajax({
        type: "post",
        url: "/movie/dislike-movie",
        data: { id: id, index:index }
    }).done((data) => {
        if (data) {
            window.location.reload();
        }
        else {
            return false;
        }
     })
});
async function deletecmt(movie_id, index) {
    $.ajax({
        url: "/movie/delete-cmt-movie",
        type: "post",
        data: {
            id: movie_id,
            index: index
        }
    }).done(function (data) {
        if (data) {
            return true;
        } else {
            return false;
        }
    })
}
$(document).on('click', '.delete-comment', async function () {

    var _id = $(this).attr('id')
    var movie_id = $('.movie-details-page-box').attr('id');
    var index = $('.' + _id).attr('id')

    $.ajax({
        url: "/movie/delete-cmt-movie",
        type: "post",
        data: {
            id: movie_id,
            index: index
        }
    }).done(function (data) {
        if (data) {
            Window.location.reload();
        } else {
            return false;
        }
    })

})
$(document).on('click', '.edit-cmt', async function () {
    var _id = $(this).attr('id')
    var movie_id = $('.movie-details-page-box').attr('id');
    var content = $('.' + _id).text();

    var index = $('.' + _id).attr('id');
    $('.txt-edit-cmt').text(content);
    $('.btn-edit-cmt-user').click(function () {
        var contentnew = $('.txt-edit-cmt').val();
        $.ajax({
            url: "/movie/edit-comment-movie",
            type: "post",
            data: {
                id: movie_id,
                content: contentnew,
                index: index
            }
        }).done(function (data) {
            if (data) {
                window.location.reload();
            } 
            else {
                return false;
            }
        })
    })
})

// $(document).ready(function(){
//     setTimeout(function(){ 
//     var movie_id = $('.movie-details-page-box').attr('id');
   
//         $.ajax({
//             url:"/movie/check-is-like",
//             type:"get",
//             data:{
//                 id:movie_id
//             }
//         }).done(function(data){
//             if(data==false)
//             {
//                 console.log(data);
//                 return false;
        
//             }
//             else
//             {
//                 var str='<i class="fa fa-thumbs-up"></i>Đã thích'
//                 $('#liked').empty();
//                 $('#liked').append(str);
//             }
//         })
//      }, 2000);
    
// })
// $('.removecmt').click(()=>{
//     var id=$(this).attr('id');
//     console.log(id);
//     return false;
// })
