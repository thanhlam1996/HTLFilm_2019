
var count=1;
$(document).on('click','.btnaddcreatemovie', function(){
    var component='<div class="form-group comment-item-'+count+'">'
    component+='<div class="row form-inline group-formcreate">'
    component+='<label class="col col-4 lable-create-title">Tiêu đề</label>'
    component+='<label class="col col-4 lable-create-producer">Nhà phát hành</label>'
    component+='<label class="col col-3 lable-create-producer">Hạn viết bài</label>'
    component+='</div>'
    component+='<div class="row form-inline">'
    component+='<input type="text" class="form-control col col-4 txt-create-title" id="create-err-title-'+count+'" name="title">'
    component+='<input type="text" class="form-control col col-4 txt-create-producer" name="producer">'
    component+='<input type="date" class="form-control col col-3 txt-create-producer" name="deadline">'
    component+='<button type="button" id="comment-item-'+count+'" class="btn btn-danger btn-removecomponentmovie">Xóa</button>'
    component+='</div>'
    component+='<label id="create-err-title-'+count+'" class="create-err-title-display">Tiêu đề đã tồn tại. Hãy chọn tiêu đề khác</label>'
    component+='</div>'
    $('.component-create').append(component);
    count++;
})
$(document).on('click','.btn-removecomponentmovie', function(){
   var id=$(this).attr("id");
   $('.'+id).remove();
})
// $(document).ready(function () {
//     $()
// });
// $(document).on('change','.txt-create-title', function(){
//     var id=$(this).attr('id');
//     var title=$("#"+id).val();
//     $.ajax({
//         type: "get",
//         url:"/movie/checktitlemovie",
//         data:{
//             "title":title
//         }
//     }).done(function(data){
//         if(data)
//         {
//             console.log("data:" +data);
//         }
//         else
//         {
//             $('.'+id).attr('style','display:block')
//         }
       
//     })
// })
// Submit

