$(document).ready(function(){
    $(".imgposter").attr('style', 'display:block');
})
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $(".imgposter").attr('style', 'display:block');
            $(".imgposter").attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$(document).ready(function () {
    $("#customFile").change(function (e) {
        var fileName = e.target.files[0].name;
        $('.file-name').val(fileName);
       readURL(this);

    });
   
});