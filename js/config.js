// Config module

/*
 * Server
 */

// $server_address = 'http://localhost:3000'; // development env
$server_address = 'http://52.79.83.67'; // production env

$server_routes = {
    check_internet_connect: {                               // 인터넷 연결 체크
        path: $server_address+'/connection',
        method: 'get'
    },

    create_user: {                                          // 회원 생성
        path: $server_address+'/users',
        method: 'post'
    },

    update_user: {                                          // 회원 수정
        path: function (id) { // 수정할 회원 id
            return ($server_address+'/users/'+id)
        },
        method: 'put'
    },

    index_gallery: {                                        // 최신 슬롯 목록을 로딩할 때 사용
        path: $server_address+'/galleries',
        method: 'get'
    },

    create_gallery: {                                       // 슬롯 추가
        path: $server_address+'/galleries',
        method: 'post'
    },

    index_user_gallery: {                                   // 팔로우 목록을 서버로부터 동기화 할 때 사용
        path: $server_address+'/user_galleries/1', // (1은 그냥 서버상에서 라우트 분류를 위해 강제로 붙어있는 것. 무의미.)
        method: 'get'
    },

    create_user_gallery: {                                  // 소위 팔로우 신청
        path: $server_address+'/user_galleries',
        method: 'post'
    },

    destroy_user_gallery: {                                 // 소위 팔로우 취소
        path: $server_address+'/user_galleries/delete',
        method: 'post'
    },

    sync_user_gallery: {                                    // 소위 팔로우 리스트 동기화
        path: $server_address+'/user_galleries/sync',
        method: 'post'
    },

    photo_file_uploader: {                                  // 개별 슬롯에 이미지 추가
        path: function (id) { // 소속 gallery 의 id
            return ($server_address+'/set_file/' + id)
        },
        method: 'post'
    }
};

function checkConnection(){
    var check = $.ajax({
        url: $server_routes.check_internet_connect.path,
        method: $server_routes.check_internet_connect.method
    });

    check.done(function (data) {
        var body = $('body');
        if (body.attr('class').split(' ').indexOf('disconnect') !== -1){
            body.removeClass('disconnect');
            wp = new WallPaper();
            wp.show_background_image('no-timer');
        }
    });

    check.fail(function (data) {
        $('body').addClass('disconnect');
    });
    setTimeout(function(){checkConnection()}, 30 * $per_sec);
}



/*
 * App token
 */

$auth_token = 'J7CBxfHalt49OSHp27hblqK20c9PgwJ108nDHX/8Cts=';


/*
 * Storage init
 */

$storage = new AppStorage();