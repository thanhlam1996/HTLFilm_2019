
$(document).ready(function () {
    $("#customFile1").change(function (e) {
        var fileName = e.target.files[0].name;
        $('.file-name').val(fileName);
       readURL(this);
    });
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#imgposter1").attr('style', 'display:block');
                $("#imgposter1").attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
   
});



$(document).on('click','.btn-cancel-writing', function(){
    window.history.back();
});
