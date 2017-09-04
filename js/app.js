var update_url_cache_timer = $interval_update_photo_urls;

var todo = new Todo();
var wp = new WallPaper();

$(document).ready(function () {
    checkConnection();
    var is_login = checkLogin();
    var user;
    if (is_login){
        user = is_login;
        set_user(user);
    }

    $system_clock.run('time_stamp');

    wp.show_background_image('default');
    setTimeout(function(){wp.cache_update(true)}, $interval_update_photo_urls);

    $('.app').click(function () {
        var name = $(this).data('target');
        app_router($(this), name);
    });

    $('.stamp-input').keyup(function (e) {
        var value = $(this).val();

        if (e.keyCode === 13){
            $.ajax({
                url: $server_routes.create_user.path,
                method: $server_routes.create_user.method,
                data: {
                    authenticity_token: $auth_token,
                    user: {
                        name: value
                    }
                }
            }).done(function (data) {
                window.localStorage.setItem($storage.key.user_id, data.id);
                window.localStorage.setItem($storage.key.user_name, data.name);
                set_user(data);
            });
        }
    });
});

function checkLogin() {
    var id = window.localStorage.getItem($storage.key.user_id);
    var name = window.localStorage.getItem($storage.key.user_name);
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

function app_router(app_btn, app_name) {
    if (app_name === 'webToon'){
        alert('열심히 준비중입니다!');
    } else if (app_name === 'toDo'){
        todo.toggle(app_btn);
    } else if (app_name === 'wallPaper'){
        wp.toggle(app_btn);
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
 *
 ******* TEMP START
 */

// functions here ...

/*
 ******* TEMP END
 */
