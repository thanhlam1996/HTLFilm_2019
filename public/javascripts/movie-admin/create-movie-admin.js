

var count = 1;
$(document).on('click', '#btnadditemmovie', function () {
    var item = '<div class="item-movie" id=' + count + '>'
    item += ' <div class="row">';
    item += ' <label class="col col-11"></label>';
    item += '  <label class="col col-1" ><button type="button" id=' + count + ' class="icon-remove-item-movie"><i class="fa fa-remove"></i></button></label>';
    item += '</div>';
    item += '<div class="row">';
    item += '<div class="col col-6">';
    item += ' <label>Tiêu đề phim</label>';
    item += ' <input type="text" class="form-control col col-10" name="title">';
    item += '</div>';
    item += '<div class="col col-6">';
    item += ' <label>Nhà phát hành</label>';
    item += '  <input type="text" class="form-control col col-10" name="producer">';
    item += '</div>';
    item += '</div>';
    item += '<div class="row">';
    item += ' <div class="col col-6 date">';
    item += '     <label>Hạn nộp bài</label>';
    item += '     <input type="date" class="form-control col col-10" name="deadline">';
    item += '  </div>';
    item += '  <div class="col col-6">';
    item += '      <label>Ghi chú</label>';
    item += '     <input type="text" class="form-control col col-10" name="note">';
    item += ' </div>';
    item += ' </div>';
    item += '</div>';
    $('.item-create-movie').append(item);
    count++;
})
$(document).on('click', '.icon-remove-item-movie', function () {
    var id = $(this).attr("id");
    $('#' + id).remove();
})
// $(document).ready(function () {

// })


