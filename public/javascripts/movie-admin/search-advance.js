$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_title').keyup(function () {
        var searchField = $('#s-advance-txt_title').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-title').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-title').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_type').keyup(function () {
        var searchField = $('#s-advance-txt_type').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-type').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-type').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_producer').keyup(function () {
        var searchField = $('#s-advance-txt_producer').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-producer').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-producer').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_actor').keyup(function () {
        var searchField = $('#s-advance-txt_actor').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-actor').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-actor').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_country').keyup(function () {
        var searchField = $('#s-advance-txt_country').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-country').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-country').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $('#s-advance-txt_director').keyup(function () {
        var searchField = $('#s-advance-txt_director').val();
        console.log(searchField)
        $.get('/movie/get-key-search?title=' + searchField, function (data) {
            $('#result-director').empty();
            if (data) {
                data.Items.forEach((i, index) => {
                    if (index > 9) {
                        return
                    } else {
                        $('#result-director').append('<li id="sa-livesearch-title"><a href="/detail-movie?id=' + i.id + '">' + i.title + '</a></li>')
                    }
                });
            }
            else {
                return false;
            }
        });
    });
});