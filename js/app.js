var todo = new Todo();
var wp = new WallPaper();

$(document).ready(function () {
    checkConnection();
    wp.storage('user_gallery', 'update');

    var is_login = checkLogin();
    var user = is_login;
    if (is_login){
        set_user(user);
    } else {
        take_user_info_process(user);
    }

    $system_clock.run('time_stamp');

    wp.show_background_image('default');
    setTimeout(function(){wp.cache_update(true)}, $interval_update_photo_urls);

    $('.app').click(function () {
        var name = $(this).data('target');
        app_router($(this), name);
    });
});


function app_router(app_btn, app_name) {
    if (app_name === 'webToon'){
        alert('열심히 준비중입니다!');
    } else if (app_name === 'toDo'){
        todo.toggle(app_btn);
    } else if (app_name === 'wallPaper'){
        wp.toggle(app_btn);
    }
}

function checkLogin() {
    var id = window.localStorage.getItem($storage.key.user_id);
    var name = window.localStorage.getItem($storage.key.user_name);
    var email = window.localStorage.getItem($storage.key.user_email);
    var user = { id: id, name: name, email: email };
    if (!id || !name || !email) { user = false }
    return user
}

function set_user(user) {
    var msg = 'Have a good day, ' + user.name;
    $('.stamp-qestion.user_name').text(msg).fadeIn(250);
    $('#apps-wrapper').show();
    $('.stamp-input').hide();
}

function take_user_info_process(obj) {
    var id = window.localStorage.getItem($storage.key.user_id);

    var name = obj.name;
    if (!name){name = window.localStorage.getItem($storage.key.user_name)}

    var email = obj.email;
    if (!email){email = window.localStorage.getItem($storage.key.user_email)}

    // 이름 정보를 가지고 있는지 확인
    if (!name){
        // console.log('이름이 없다!');
        $('.stamp-input.user_name').unbind().keyup(function (e) {
            var value = $(this).val();

            if (e.keyCode === 13){
                $('.user_name').fadeOut(250);
                $('.stamp-qestion.user_email .name_point').text(value);

                setTimeout(function(){
                    $('.user_email').fadeIn();
                    take_user_info_process({name: value, email: email});
                }, 500);
            }
        });
        return false
    }

    // 이메일 정보를 가지고 있는지 확인
    if (!email){
        // console.log('이메일이 없다!');
        $('.stamp-qestion.user_email .name_point').text(name);
        $('.user_name').hide();
        $('.user_email').show();

        $('.stamp-input.user_email').unbind().keyup(function (e) {
            var value = $(this).val();

            if (e.keyCode === 13){
                $('.user_email').fadeOut(250);

                setTimeout(function () {
                    take_user_info_process({name: name, email: value});
                }, 500);
            }
        });
        return false
    }

    // 정보들이 완성 됐을 때
    if (name && email){
        var call;
        var url; var method;

        if (!id) { // 신규 유저인 경우 user 를 생성
            url = $server_routes.create_user.path;
            method = $server_routes.create_user.method;

        } else { // 기존 유저인 경우 정보를 update
            url = $server_routes.update_user.path(id);
            method = $server_routes.update_user.method;

        }

        call = $.ajax({
            url: url,
            method: method,
            data: {
                authenticity_token: $auth_token,
                user: {
                    name: name,
                    email: email
                }
            }
        });

        call.done(function (data) {
            window.localStorage.setItem($storage.key.user_id, data.id);
            window.localStorage.setItem($storage.key.user_name, data.name);
            window.localStorage.setItem($storage.key.user_email, data.email);
            set_user(data);
        });
    }
}

/*
 * TODO: To Refactor Guide
 *
 * todo 1. Restful-Storage
 * todo 2. rebind
 * todo 3. format/template/simpleFn
 * todo 4. UI-builder
 * todo 5. Touch-API
 */

// Todo: 앱 설명 가다듬기 (patch)
// Todo: 회원 가입 절차에 이메일 주소 입력 추가하기
// Todo: 비밀 슬롯 기능 만들기
