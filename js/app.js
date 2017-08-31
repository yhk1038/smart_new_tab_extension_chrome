_tt_ = 'J7CBxfHalt49OSHp27hblqK20c9PgwJ108nDHX/8Cts=';

var per_sec = 1000;
var per_min = per_sec * 60;
var per_hour = per_min * 60;
var per_day = per_hour * 24;
// var server_address = 'http://localhost:3000';
var server_address = 'http://52.79.83.67';

var set_background_image_timer = 1 * per_min;
var update_url_cache_timer = 30 * per_min;

$(document).ready(function () {
    var is_login = checkLogin();
    var user;
    if (is_login){
        user = is_login;
        set_user(user);
    }

    set_timer();

    setBackgroundImage('default');
    setTimeout(function(){update_cached_urls(true)}, update_url_cache_timer);

    $('.app').click(function () {
        var name = $(this).data('target');
        var action = parseAction($(this));

        if (name === 'webToon'){
            alert('열심히 준비중입니다!');
        } else if (name === 'toDo'){
            todo($(this));
        } else if (name === 'wallPaper'){
            wallPaper($(this), action);
        }
    });

    $('.stamp-input').keyup(function (e) {
        var value = $(this).val();

        if (e.keyCode === 13){
            $.ajax({
                url: server_address+'/users',
                method: 'post',
                data: {
                    authenticity_token: _tt_,
                    user: {
                        name: value
                    }
                }
            }).done(function (data) {
                window.localStorage.setItem('SNT_USER_ID', data.id);
                window.localStorage.setItem('SNT_USER_NAME', data.name);
                set_user(data);
            });
        }
    });

    $('.add-slot-body .closeBtn').click(function () {
        close_add_slot_window();
    });
    $('#add-slot').find('input[type=checkbox]').click(function () {
        if ($(this).is(':checked')){
            $('.add-slot-private_group').fadeIn('fast');
        } else {
            $('.add-slot-private_group').fadeOut('fast');
        }
    });
    $('.add-slot-body .confirmBtn').click(function () {
        add_slot_request();
    })
});

function checkLogin() {
    var id = window.localStorage.getItem('SNT_USER_ID');
    var name = window.localStorage.getItem('SNT_USER_NAME');
    var user = { id: id, name: name };
    if (!id){ user = false }
    return user
}

function set_user(user) {
    var msg = 'Have a good day, ' + user.name;
    $('.stamp-qestion').text(msg);
    $('#apps-wrapper').show();
    $('.stamp-input').hide();
}

function set_timer() {
    var height = window.screen.height;
    var timeStamp = $('#time-stamp');
    timeStamp.css('top', (height / 2 - 180)+'px');

    tictok();
}

function tictok() {
    var currentDate = new Date();
    var currentHours = currentDate.getHours();
    var currentMinute = currentDate.getMinutes();

    if(currentHours > 12){
        currentHours = currentHours - 12;
    }

    if(currentMinute < 10){
        currentMinute = '0' + currentMinute;
    }

    var now = currentHours+':'+currentMinute;

    var mother = document.getElementById('time-stamp');
    var target = mother.getElementsByClassName('stamp-size')[0];
    target.innerText = now;

    setTimeout(function(){tictok()}, 1000);
}

function parseAction(el) {
    var i = el.attr('class').split(' ').indexOf('open');
    var result = 'open';
    if (i !== -1){
        result = 'close';
    }
    return result
}

function wallPaper(appBtn, action) {
    if (action === 'open') { openWallPaperProcess(appBtn) }
    else if (action === 'close') { closeWallPaperProcess(appBtn) }
}

function openWallPaperProcess(appBtn) {
    getWallPaperGalleries();

    var appBox = $('#wallPaper');
    var ground = $('#app-content');

    ground.addClass('active');
    // ground.find('.app_box').slideDown(500);

    appBtn.addClass('open');
    appBox.addClass('open');
    // console.log('open');
}

function closeWallPaperProcess(appBtn) {
    var appBox = $('#wallPaper');
    var ground = $('#app-content');

    appBtn.removeClass('open');
    appBox.removeClass('open');

    // ground.find('.app_box').slideUp(500);
    ground.removeClass('active');
    // console.log('close');
}

function getWallPaperGalleries(){
    var user_id = window.localStorage.getItem('SNT_USER_ID');
    var call = $.ajax({
        url: server_address + '/galleries',
        method: 'get',
        data: {
            user_id: user_id
        }
    });

    var dom = '<div class="item-list">' +
                    '<p style="text-align: center"><span class="" style="display: none;">슬롯 이름 <input type="text"></span>슬롯 만들기</p>' +
                    '<label class="insert_wp_slot-label"></label>' +
                '</div>';
    call.done(function (data) {
        $.each(data, function (i, gallery) {
            dom += wallPaperItemFormat(gallery.id, gallery.name, gallery.photos, gallery.is_followed);
        });
        $('#wallPaper').find('.card-body').html(dom);
        checkBoxReBinding();
        wpfileClickReBinding();

        $('.insert_wp_slot-label').click(function () {
            var addSlotGround = $('#add-slot');
            addSlotGround.fadeIn('fast');
        });
    });
}

function checkBoxReBinding() {
    $('input[type="checkbox"]:not(".in_add_slot")').unbind().click(function () {
        var t = $(this);
        clickCheckBox(t);
    });
}

// 배경 플레이 체크박스를 체크했을 때.
function clickCheckBox(t) {
    var user_id = window.localStorage.getItem('SNT_USER_ID');
    var gallery_id = t.data('id');
    var is_taken = (t.attr('class').split(' ').indexOf('taken') !== -1);
    //var wp_follow_lists = JSON.parse('['+(window.localStorage.getItem('SNT_WP_FollowLists'))+']');
    var wp_follow_lists = JSON.parse(window.localStorage.getItem('SNT_WP_FollowLists'));
    if (wp_follow_lists === null) { wp_follow_lists = [] }

    var call;
    if (is_taken){ // destroy 'UserGallery Record'
        // console.log('delete user_gallery');
        call = $.ajax({
            url: server_address+'/user_galleries/delete',
            method: 'post',
            data: {
                authenticity_token: _tt_,
                user_gallery: {
                    user_id: user_id,
                    gallery_id: gallery_id
                }
            }
        });

        call.done(function (deleted_datas) {
            // 로컬 스토리지에 리스트 삭제를 반영해 업데이트
            $.each(deleted_datas, function (i, deleted_data) {
                var obj = {id: deleted_data.id, user_id: deleted_data.user_id.toString(), gallery_id: deleted_data.gallery_id};
                $.each(wp_follow_lists, function (j, item) {
                    var index = wp_follow_lists.indexOf(item);
                    if (item && item.id === obj.id) { wp_follow_lists.splice(index, 1) }
                });
            });

            var checkBox = $('.checkBox input[data-id="'+gallery_id+'"]');
            checkBox.removeClass('taken');
            checkBox.removeAttr('checked');
            checkBox.closest('p').removeClass('taken');

            window.localStorage.setItem('SNT_WP_FollowLists', JSON.stringify(wp_follow_lists));
            update_cached_urls(false);
        });
    }

    else { // create 'UserGallery Record'
        // console.log('create user_gallery');
        call = $.ajax({
            url: server_address+'/user_galleries',
            method: 'post',
            data: {
                authenticity_token: _tt_,
                user_gallery: {
                    user_id: user_id,
                    gallery_id: gallery_id
                }
            }
        });

        call.done(function (data) {
            // 스토리지를 업데이트 해주고
            var obj = {id: data.id, user_id: user_id, gallery_id: gallery_id};
            wp_follow_lists.push(obj);
            window.localStorage.setItem('SNT_WP_FollowLists', JSON.stringify(wp_follow_lists));
            // console.log(JSON.parse(window.localStorage.getItem('SNT_WP_FollowLists')));

            var checkBox = $('.checkBox input[data-id="'+obj.gallery_id+'"]');
            checkBox.addClass('taken');
            checkBox.attr('checked', 'checked');
            checkBox.closest('p').addClass('taken');

            // 배경에 반영.
            update_cached_urls(false);
        });
    }
    checkBoxReBinding();
    wpfileClickReBinding();
}

function wallPaperItemFormat(id, name, photo_count, followed){
    var checked = '';
    var taken = '';
    if (followed === true){
        checked = 'checked';
        taken = 'taken';
    }
    var request_url = server_address+'/set_file/'+id;
    var dom = '' +
        '<div class="item-list" data-gallery="'+ id +'">' +
            '<p class="'+taken+'">' +
                '<label class="checkBox switch">' +
                    '<input class="'+taken+'" type="checkbox" data-id="'+ id +'" data-taken="'+ followed +'" '+ checked +'>' +
                    '<span class="slider"></span>' +
                '</label>' +
                ''+ name +' ('+ photo_count +'개)' +
            '</p>' +
            '<form id="wallPaper_form" class="wallPaper_form" action="'+request_url+'" data-remote="true" method="post" enctype="multipart/form-data">' +
                '<input type="hidden" name="authenticity_token">' +
                '<label class="insert_wp_file-label">' +
                    '<input type="file" id="gallery_file_input-'+id+'" name="image_file">' +
                '</label>' +
            '</form>' +
        '</div>';
    return dom;
}

function setBackgroundImage(status) {
    // // console.log("");
    // // console.log('set background image ', status);

    var is_login = checkLogin();
    var have_own_data = JSON.parse(window.localStorage.getItem('SNT_WP_FollowLists'));
    var dir = './imgs/wallpaper/';
    var imgPath = dir + 'momentum_bgimg_1.jpg';

    // users default
    if (is_login && have_own_data){
        if (!cached_urls()){
            load_my_default_wallpapers(have_own_data);
        }
        var urls = cached_urls();
        if (urls && urls.length >= 1){
            imgPath = urls[Math.floor(Math.random() * urls.length)];
        }

        // // console.log('urls: ', urls);
        // // console.log('imgPath: ', imgPath);
    }

    // have special options?
    if (status !== 'default'){

    }

    var url = 'url('+imgPath+')';
    // // console.log(url);
    $('.bgimg').css('background-image', url);

    if (status !== 'no-timer'){
        setTimeout(function(){setBackgroundImage('default')}, set_background_image_timer);
    }
}

function load_my_default_wallpapers(myFollowLists) {
    var arr = [];
    if (myFollowLists){
        if (myFollowLists.length !== 0){
            $.each(myFollowLists, function (i, item) {
                arr.push(item.id);
            });
        }

        $.ajax({
            url: server_address+'/user_galleries/1',
            method: 'get',
            data: {
                ids: arr,
                user_id: window.localStorage.getItem('SNT_USER_ID')
            }
        }).done(function (data) {
            console.log('data: ', data);
            url_cacher(data, 'reset');
        });
    }
}

function cached_urls() {
    var row = window.localStorage.getItem('SNT_cached_wallpapers_url');
    var result = null;
    if(row){
        result = row.split(',');
    }
    return result;
}
function url_cacher(urls, option) {
    // urls: must be Typed in Array.
    var cached_urls_array = [];

    if (option === 'append'){
        if (cached_urls()){
            cached_urls_array = cached_urls();
        }
    }
    else if (option === 'reset'){
        // Default !!!
        // cached_urls_array = urls; // 아래에서 이거 함ㅇㅇ.
    } else if (option === 'delete'){
        // 캐시 삭제 하는거 만들어야 함.
    }

    $.each(urls, function (i, url) {
        cached_urls_array.push(url);
    });
    window.localStorage.setItem('SNT_cached_wallpapers_url', cached_urls_array);

    return cached_urls();
}

function update_cached_urls(set_timer) {
    // console.log('update cached url processor called');
    var have_own_data = JSON.parse(window.localStorage.getItem('SNT_WP_FollowLists'));
    if (have_own_data){
        load_my_default_wallpapers(have_own_data);
    }

    if (!set_timer){
        // // console.log('set bgimg');
        setBackgroundImage('no-timer');
    }

    if (set_timer){
        setTimeout(function(){update_cached_urls(true)}, update_url_cache_timer);
    }
}


function wpfileClickReBinding() {
    $('.insert_wp_file-label').unbind().change(function () {
        var input_label = $(this);
        var file_input_id = input_label.find('input:file').attr('id');
        var file_input = document.getElementById(file_input_id);

        var formContainer = $(this).closest('.wallPaper_form');
        formContainer.find('input[type="hidden"]').val(_tt_);

        var gallery_slot = $(this).closest('.item-list');
        var gallery_id = gallery_slot.data('gallery');

        var bg = $('.bgimg');
        var original_bg = bg.css('background-image');

        //get file object
        var file = file_input.files[0];
        var fileValue = $('#'+file_input_id).val().split('\\');
        var fileName = fileValue[fileValue.length-1];

        // // console.log(original_bg);
        // // console.log(file);
        if (file) {
            // // console.log(fileName);
            // // console.log(gallery_id);

            // create reader
            var reader = new FileReader();
            // reader.readAsText(file);
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                // // console.log(e.target.result);
                // // console.log(reader.result);
                // // console.log()
                bg.css('background-image', 'url('+reader.result+')');
                // // console.log(bg.css('background-image'));
                closeWallPaperProcess($('.app'));

                // browser completed reading file - display it
                setTimeout(
                    function () {
                        if (confirm('업로드 한 파일을 미리보기 하는 중!\n화질과 비율이 적합하다면 확인 버튼을 눌러 업로드!'))
                        {
                            // 서버에 저장하고
                            // 로컬에 저장하고
                            // 캐시를 갱신한다
                            var form = formContainer[0];
                            var formData = new FormData(form);
                            formData.append(fileName, file);

                            formContainer.ajaxSubmit({
                                beforeSubmit: function(a,f,o) {
                                    o.dataType = 'json';
                                },
                                complete: function(XMLHttpRequest, textStatus) {
                                    var data = XMLHttpRequest.responseJSON;
                                    // // console.log(data.id, server_address+data.image.url);
                                    if (data){
                                        alert('저장 했어요!');
                                        openWallPaperProcess($('.app[data-target="wallPaper"]'));
                                    }

                                    getWallPaperGalleries();
                                }
                            });
                        }
                        else
                        {
                            // 사진을 원래대로 돌리고 미리보기를 종료한다.
                            bg.css('background-image', original_bg);
                            openWallPaperProcess($('.app[data-target="wallPaper"]'));
                        }
                    }, 2500
                );
            };
        }
    });
}

function add_slot_request() {
    var ground = $('.add-slot-body');
    var input = ground.find('.new_slot_name input');
    var slot_name = input.val();

    if (slot_name.length > 1){
        $.ajax({
            url: server_address + '/galleries',
            method: 'post',
            data: {
                authenticity_token: _tt_,
                gallery: {
                    name: slot_name
                },
                user_id: window.localStorage.getItem('SNT_USER_ID')
            }
        }).done(function (data) {
            // var obj = {id: data.id, name: data.name, };
            getWallPaperGalleries();
            update_cached_urls(false);
            // $('#wallPaper').find('.card-body').prepend();
            close_add_slot_window();
        });
    } else {
        alert('이름은 한 글자 이상으로 지어주세요!');
    }
}

function close_add_slot_window() {
    var addSlotGround = $('#add-slot');
    addSlotGround.find('input').val('');
    addSlotGround.find('input[type=checkbox]').prop('checked', false);
    addSlotGround.find('textarea').val('');
    $('.add-slot-private_group').fadeOut('fast');
    addSlotGround.fadeOut('fast');
}