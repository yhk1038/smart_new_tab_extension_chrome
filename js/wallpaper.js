// Wallpaper Module
$wallpaper = new WallPaper();

$(document).ready(function () {

    // 배경화면 슬롯 목록 닫기 버튼 클릭
    $('.card-closeBtn').click(function () {
        $wallpaper.toggle_galleries_container($('.app'), 'close');
    });


    // 슬롯 추가 다이얼로그 닫기 버튼 클릭
    $('.add-slot-body .closeBtn').click(function () {
        $wallpaper.addslot_window_close();
    });

    // 슬롯 추가 확인 버튼 클릭
    $('.add-slot-body .confirmBtn').click(function () {
        $wallpaper.addslot_add_request();
    });

    // 비밀 슬롯이 체크되면
    $('#add-slot').find('input[type=checkbox]').click(function () {
        if ($(this).is(':checked')){
            // 비밀 슬롯 활성화
            $('.add-slot-private_group').fadeIn('fast');
        } else {
            // 비밀 슬롯 비활성화
            $('.add-slot-private_group').fadeOut('fast');
        }
    });

    // 이미지 뷰어 종료
    $('#wallPaper-viewer').find('.close').click(function () {
        $wallpaper.close_viewer();
    });
});



/*
 * Namespace functions
 *
 * 클래스 메서드로 만들면 클래스를 무한히 생성하게 되므로
 * 네임스페이스 형태로 바깥에 두도록 한다
 *
 * >>> 이 모듈의 네임스페이스 함수 전부 없앰
 */



/*
 * Define WallPaper Class
 * methods:
 *
 */

function WallPaper() {
    // 앱 토글 (버튼 클릭을 클릭한 경우)
    this.toggle = function (btn) {
        $wallpaper.toggle_galleries_container(btn);
    };

    // 데이터 레코드의 형태(구조)를 정의
    this.record_scheme = function (item, status) {
        return (
            {
                id:         parseInt(item.id),
                user_id:    parseInt(item.user_id),
                gallery_id: parseInt(item.gallery_id)
            }
        )
    };

    // UI format 을 이 곳에서 모두 정의
    this.format = {
        // 슬롯 추가하는 슬롯 ui
        first_slot: (
            '<div class="item-list">' +
                '<p style="text-align: center">' +
                    '<span class="" style="display: none;">' +
                        '슬롯 이름 <input type="text">' +
                    '</span>' +
                    '슬롯 만들기' +
                '</p>' +
                '<label class="insert_wp_slot-label"></label>' +
            '</div>'
        ),

        // 슬롯 ui
        slot: function (gallery) {
            var checked = ''; var taken = '';
            var request_url = $server_routes.photo_file_uploader.path(gallery.id);
            if (gallery.is_followed === true){
                checked = 'checked';
                taken = 'taken';
            }

            return (
                '<div class="item-list" data-gallery="'+ gallery.id +'">' +
                    '<p class="'+taken+'">' +
                        '<label class="checkBox switch">' +
                            '<input class="'+taken+'" type="checkbox" data-id="'+ gallery.id +'" data-taken="'+ gallery.is_followed +'" '+ checked +'>' +
                            '<span class="slider"></span>' +
                        '</label>' +
                        ''+ gallery.name +' ('+ gallery.photos +'개)' +
                    '</p>' +
                    '<form id="wallPaper_form" class="wallPaper_form" action="'+request_url+'" data-remote="true" method="post" enctype="multipart/form-data">' +
                        '<input type="hidden" name="authenticity_token">' +
                        '<label class="insert_wp_file-label">' +
                            '<input type="file" id="gallery_file_input-'+gallery.id+'" name="image_file">' +
                        '</label>' +
                    '</form>' +
                '</div>'
            )
        },

        // 이미지 뷰어의 각 배경 이미지 섹션
        viewer_photo: function (photo, url, author) {
            return (
                '<div class="preview-img" style="background-image: url('+url+');">' +
                    '<div class="preview-img-info">' +
                        '<p class="img-created_at">Upload : <span class="bind_point">'+photo.created_at.split("T")[0]+'</span></p>' +
                        '<p class="img-created_at">By : <span class="bind_point">'+author.name+'</span></p>' +
                        '<a class="delete_img-btn" data-id="'+photo.id+'">삭제</a>' +
                    '</div>' +
                '</div>'
            )
        }
    };

    // 레코드 유효성 검증
    this.item_valid = function (item) {
        return item
    };
}


/*
 * [UI element] WallPapers Main Template (슬롯 목록 창)
 *
 * 1. 페이지 로딩이 완료되었을 때
 */

WallPaper.prototype.build_template = function () {
    // console.log('build');
    var cls = this;
    var call = $.ajax({
        url: $server_routes.index_gallery.path,
        method: $server_routes.index_gallery.method,
        data: {
            user_id: window.localStorage.getItem($storage.key.user_id)
        }
    });

    call.done(function (data) {
        var dom = cls.format.first_slot;

        $.each(data, function (i, gallery) {
            dom += cls.format.slot(gallery);
        });
        $('#wallPaper').find('.card-body').html(dom);

        cls.rebind();

        $('.insert_wp_slot-label').click(function () {
            $('#add-slot').fadeIn('fast'); // 슬롯 추가하기 창
        });
    });
};


/*
 * [UI element] 슬롯 추가 다이얼로그 종료
 *
 * 1. 슬롯 추가 요청이 완료되었을 때
 * 2. 닫기 버튼을 클릭했을 때
 */

WallPaper.prototype.addslot_window_close = function () {
    var addSlotGround = $('#add-slot');
    addSlotGround.find('input').val('');
    addSlotGround.find('input[type=checkbox]').prop('checked', false);
    addSlotGround.find('textarea').val('');
    $('.add-slot-private_group').fadeOut('fast');
    addSlotGround.fadeOut('fast');
};

WallPaper.prototype.addslot_add_request = function () {
    var cls = this;
    var ground = $('.add-slot-body');
    var input = ground.find('.new_slot_name input');
    var slot_name = input.val();

    if (slot_name.length > 1){
        $.ajax({
            url: $server_routes.create_gallery.path,
            method: $server_routes.create_gallery.method,
            data: {
                authenticity_token: $auth_token,
                gallery: {
                    name: slot_name
                },
                user_id: window.localStorage.getItem($storage.key.user_id)
            }
        }).done(function (data) {
            cls.build_template();
            cls.cache_update(false);
            cls.addslot_window_close();
        });
    } else {
        alert('이름은 한 글자 이상으로 지어주세요!');
    }
};


/*
 * [UI element] 슬롯 포함된 이미지 뷰어 다이얼로그 종료
 */

WallPaper.prototype.close_viewer = function () {
    $('#wallPaper-viewer').fadeOut(250);
};

/*
 * [UI element] 슬롯 포함된 이미지 뷰어 다이얼로그 실행
 */

WallPaper.prototype.open_viewer = function (gallery_id) {
    var cls = this;
    var viewer = $('#wallPaper-viewer');
    viewer.fadeIn(250);

    $.ajax({
        url: $server_routes.show_gallery.path(gallery_id),
        method: $server_routes.show_gallery.method
    }).done(function (data) {
        var gallery = data[0];
        var photos = data[1];
        var users_count = data[2];
        var data_set = data[3];
        var dom = '';

        viewer.find('.gallery_title').text(gallery.name);
        viewer.find('.gallery_photo_count').text(photos.length);
        viewer.find('.follower_count').text(users_count);

        $.each(data_set, function (i, h) {
            var photo = h.obj;
            dom += cls.format.viewer_photo(photo, h.url, h.author);
        });
        viewer.find('.container').html(dom);

        // rebind special buttons
        // delete btn
        $('.delete_img-btn').unbind().click(function () {
            var photo_id = $(this).data('id');
            var photo_section = $(this).closest('.preview-img');

            if (confirm('정말 삭제할까요?')){
                $.ajax({
                    url: $server_routes.destroy_photo.path(photo_id),
                    method: $server_routes.destroy_photo.method
                }).done(function (data) {
                    console.log(data);
                    photo_section.slideUp();
                }).fail(function (data) {
                    alert('원인을 알 수 없는 오류로 인해 삭제에 실패 했습니다ㅠ');
                });
            }
        });
    });
};


/*
 * [Method] 앱 토글
 *
 * 버튼 클릭을 클릭한 경우가 아닌, 소스 상에서의 전환처리에 사용
 */

WallPaper.prototype.toggle_galleries_container = function (appBtn){
    var appBox = $('#wallPaper');
    var ground = $('#app-content');
    var action = (appBtn.attr('class').split(' ').indexOf('open') === -1) ? 'open' : 'close';

    if (action === 'open') {
        // 갤러리 정보를 받아옴
        this.build_template();
    }

    appBtn.toggleClass('open');
    appBox.toggleClass('open');
    ground.toggleClass('active');
};


/*
 * [Method] 배경 화면 전환
 *
 * 1. 최초 문서 로드가 완료 되었을 때(set timer)
 * 2. url 캐시를 업데이트 할 때(no timer) (정기, 미리보기 포함)
 */

// todo 원래 커넥션 체크를 하려고 조건문을 만들어 두었지만,
// todo 기본 설정이 false 인 상태로 시작해서는 로딩이 자연스럽지 못해
// todo 일단 변수 없이 true 설정으로 inline coding 해두고
// todo 까만색이었던 배경 스타일을 살짝 투명한 회색 배경으로 대체하는 방법으로 해결했다.
// todo 그러나 커넥션 체크는 계속 하고, 커넥팅 되면 곧바로 배경화면을 로드 해줄 수 있게 고쳐야 한다.

WallPaper.prototype.show_background_image = function (status) { // status: 'default' or 'no-timer'
    // console.log('show background image called');
    var cls = this;
    var my_galleries = cls.storage('user_gallery', 'index');
    var imgPath = $default_img_path;

    // users default
    if (true) {
        if (my_galleries) {
            var urls = cls.storage('cached_img', 'get');
            if (urls && urls.length >= 1) {
                imgPath = urls[Math.floor(Math.random() * urls.length)];
            }
        }
    }

    $('.bgimg').css('background-image', 'url('+imgPath+')');

    if (status !== 'no-timer'){
        setTimeout(function(){cls.show_background_image('default')}, $interval_background_image);
    }
};


/*
 * [Method] 배경 이미지 캐시(주소목록) 업데이트, 배경에 즉각 반영
 *
 * 1. 페이지 로딩 완료시 타이머와 함께 호출
 * 2. 슬롯 추가 요청 완료시 호출
 * 3. 슬롯 스위치 on/off 할 때 각 각 호출
 */

WallPaper.prototype.cache_update = function (set_timer){
    // console.log('cache update called');
    var cls = this;
    var my_galleries = cls.storage('user_gallery', 'index');
    if (my_galleries){
        cls.take_my_wallpapers(my_galleries);
    }

    if (!set_timer){
        setTimeout(function(){cls.show_background_image('no-timer')}, 1000);
    }

    if (set_timer){
        setTimeout(function(){cls.cache_update(true)}, $interval_update_photo_urls);
    }
};


/*
 * [Method] 이미지 주소 로드
 *
 * 서버로부터 내가 활성화 시킨 슬롯들의 이미지 주소들을 받아온다
 * 받아온 주소들을 캐시형 스토리지에 저장한다
 *
 * <private>
 * (public) cache_update 함수의 자식 함수
 * (private) cached_img setter 의 부모 함수
 */

WallPaper.prototype.take_my_wallpapers = function (my_galleries) {
    // console.log('take my wallpapers, and my_galleries: ', my_galleries);
    var cls = this; var arr = [];
    if (my_galleries){
        if (my_galleries.length !== 0){
            $.each(my_galleries, function (i, item) {
                arr.push(item.id);
            });
        }

        $.ajax({
            url: $server_routes.index_user_gallery.path,
            method: $server_routes.index_user_gallery.method,
            data: {
                // ids: arr,
                user_id: window.localStorage.getItem($storage.key.user_id)
            }
        }).done(function (data) {
            // console.log('urls data: ', data);
            cls.storage('cached_img', 'set', data);
        });
    }
};



/*
 * [Method] 스위치 토글
 *
 * 슬롯 스위치를 클릭했을 때 실행
 * 스위치 요소에 기록된 class 상태('taken' class 의 존재여부)를 통해
 * destroy / create 중 실행할 action 을 결정
 */

WallPaper.prototype.slot_switch_trigger = function (t) {
    var cls = this;
    var user_id = window.localStorage.getItem($storage.key.user_id);
    var gallery_id = t.data('id');
    var is_taken = (t.attr('class').split(' ').indexOf('taken') !== -1);

    var call;
    if (is_taken){ // destroy 'UserGallery Record'
        // console.log('delete user_gallery');
        call = $.ajax({
            url: $server_routes.destroy_user_gallery.path,
            method: $server_routes.destroy_user_gallery.method,
            data: {
                authenticity_token: $auth_token,
                user_gallery: {
                    user_id: user_id,
                    gallery_id: gallery_id
                }
            }
        });

        call.done(function (deleted_data_list) {
            // 스토리지에서 리스트를 삭제하고
            cls.storage('user_gallery', 'destroy', deleted_data_list);

            // 배경에 반영.
            cls.cache_update(false);
        });
    }

    else { // create 'UserGallery Record'
        // console.log('create user_gallery');
        call = $.ajax({
            url: $server_routes.create_user_gallery.path,
            method: $server_routes.create_user_gallery.method,
            data: {
                authenticity_token: $auth_token,
                user_gallery: {
                    user_id: user_id,
                    gallery_id: gallery_id
                }
            }
        });

        call.done(function (data) {
            // 스토리지를 업데이트 해주고
            cls.storage('user_gallery', 'create', data);

            // 배경에 반영.
            cls.cache_update(false);
        });
    }
    cls.rebind();
};


/*
 * [Method] 배경 이미지 파일 업로드
 *
 * 배경 이미지를 업로드 하기 위한 모든 과정을 포함하고 있음
 */

WallPaper.prototype.file_upload_manager = function (input_label) {
    var cls = this;
    var file_input_id = input_label.find('input:file').attr('id');
    var file_input = document.getElementById(file_input_id);
    var formContainer = input_label.closest('.wallPaper_form');
    // console.log("\n\n\n\n", input_label, file_input_id, file_input, formContainer, "\n\n\n\n");

    // authenticity token 을 주입
    formContainer.find('input[type="hidden"]').val($auth_token);

    var bg = $('.bgimg');
    var original_bg = bg.css('background-image');

    // file 오브젝트를 가져옴
    var file = file_input.files[0];
    var fileValue = $('#'+file_input_id).val().split('\\');
    var fileName = fileValue[fileValue.length-1];

    // console.log(fileName, file);
    if (file) {

        // create reader
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            bg.css('background-image', 'url('+reader.result+')');
            cls.toggle_galleries_container($('.app'), 'close');

            // browser completed reading file - display it
            setTimeout(
                function () {
                    if (confirm('업로드 한 파일을 미리보기 하는 중!\n화질과 비율이 적합하다면 확인 버튼을 눌러 업로드!'))
                    {
                        // 데이터를 폼에 셋업
                        var form = formContainer[0];
                        var formData = new FormData(form);
                        formData.append(fileName, file);
                        // console.log(formContainer);
                        // console.log('confirm', reader);

                        // 서버에 저장
                        formContainer.ajaxSubmit({
                            beforeSubmit: function(a,f,o) {
                                o.dataType = 'json';
                                // console.log(a, f, o);
                            },
                            success: function(XMLHttpRequest, textStatus) {
                                // console.log(XMLHttpRequest, textStatus);
                                var data = XMLHttpRequest.responseJSON;
                                if (data){
                                    alert('저장 했어요!');
                                    // 로컬에 저장하고
                                    // 캐시를 갱신한다
                                    cls.toggle_galleries_container($('.app[data-target="wallPaper"]'), 'open');
                                }

                                cls.build_template();
                            },
                            error: function (data) {
                                console.log("\nerror break\n", data)
                            }
                        });
                    }
                    else
                    {
                        // 사진을 원래대로 돌리고 미리보기를 종료한다.
                        bg.css('background-image', original_bg);
                        cls.toggle_galleries_container($('.app[data-target="wallPaper"]'), 'open');
                    }
                }, 2000 // $interval_update_photo_preview
            );
        };
    }
};



/*
 * Rebind Event Listener for Template changing
 *
 *   Rebind 가 필요한 경우:
 *
 *   case: "슬롯 rebinding"
 *      1. 슬롯 목록을 열었을 때 (최신 슬롯 목록을 받아오므로)
 *      3. 슬롯을 추가 했을 때
 *
 *   case: "스위치(checkBox) rebinding"
 *      1. 각 슬롯을 활성화/비활성화 했을 때
 *      2. 슬롯 목록을 열었을 때 (최신 슬롯 목록을 받아오므로)
 *      3. 슬롯을 추가 했을 때
 *
 *   Rebind 는 다음을 rebinding 한다:
 *      - toggle_switch onclick listener
 *      - add_file button onchange listener
 *      - open_viewer onclick listener
 */

WallPaper.prototype.rebind = function () {
    var cls = this;
    /*
     * switch_toggle: function () {
     */
    $('input[type="checkbox"]:not(".in_add_slot")').unbind().click(function () {
        cls.slot_switch_trigger($(this));
    });
    // },

    /*
     * insert_file_button: function () {
     * !~~ onChange Listener ~~!
     */
    $('.insert_wp_file-label').unbind().change(function () {
        cls.file_upload_manager($(this));
    });
    // }

    /*
     * open_viewer_trigger: function () {
     */
    $('.item-list p').unbind().click(function () {
        var gallery_id = $(this).closest('.item-list').data('gallery');
        if (gallery_id){
            cls.open_viewer(gallery_id);
        }
    });
    // }
};


/*
 * Methods for [ Restful Storage ]
 */

WallPaper.prototype.storage = function (label, method, item) {
    var result; var cls = this;
    var arr; var arr2; var items;

    // Storage for UserGallery
    if (label === 'user_gallery')
    {
        /*
         * Index
         */
        if (method === 'index')
        {   // GET '/user_galleries'
            var res = JSON.parse(window.localStorage.getItem($storage.key.wallpaper));
            result = (res) ? res : [];
            return result
        }

        /*
         * Show
         */
        // else if (method === 'show' && item)
        // {}

        /*
         * Create
         */
        else if (method === 'create' && item)
        {   // Post '/user_galleries'
            item = cls.record_scheme(item);
            items = cls.storage('user_gallery', 'index');
            items.push(item);
            window.localStorage.setItem($storage.key.wallpaper, JSON.stringify(items));

            $('.checkBox input[data-id="'+item.gallery_id+'"]')
                .addClass('taken')
                .attr('checked', 'checked')
                .closest('p').addClass('taken');

            result = items;
            return result
        }

        /*
         * Update (void, 독립 실행 함수)
         */
        else if (method === 'update') /* 서버와 Storage 를 싱크함. 페이지 로딩이 완료되면 최초 1회 호출 */
        {   // 스토리지의 user_gallery 데이터들을 서버에 동기화
            // 일치하지 않으면, 서버에서 내 계정에 client 를 기준으로 레코드 강제 생성하는 방식
            // 그리고 나서 반환된 내 계정의 user_gallery 들로 스토리지를 리셋
            items = cls.storage('user_gallery', 'index');
            arr = []; arr2 = [];
            var user_id = window.localStorage.getItem($storage.key.user_id);

            // 회원가입이 되어있는 user 에 한해 실시
            if (user_id){
                $.each(items, function (i, client_item) {
                    var id = client_item.id;
                    arr.push(id);
                });

                $.ajax({
                    url: $server_routes.sync_user_gallery.path,
                    method: $server_routes.sync_user_gallery.method,
                    data: {
                        authenticity_token: $auth_token,
                        ids: arr,
                        user_id: user_id
                    }
                }).done(function (data) {
                    $.each(data.galleries, function (j, n_item) {
                        n_item = cls.record_scheme(n_item);
                        arr2.push(n_item);
                    });
                    window.localStorage.setItem($storage.key.wallpaper, JSON.stringify(arr2));
                    window.localStorage.setItem('SNT_cached_wallpapers_url', data.urls);
                });
            }

        }

        /*
         * Destroy
         */
        else if (method === 'destroy' && item) /* 여기서 item 은 items Array 를 받아온다! */
        {   //
            var d_items = item;
            items = cls.storage('user_gallery', 'index');

            $.each(d_items, function (i, d_item) {
                var obj = cls.record_scheme(d_item);
                $.each(items, function (j, item) {
                    var index = items.indexOf(item);
                    if (item && item.id === obj.id) { items.splice(index, 1) }
                });

                $('.checkBox input[data-id="'+obj.gallery_id+'"]')
                    .removeClass('taken')
                    .removeAttr('checked')
                    .closest('p').removeClass('taken');
            });

            window.localStorage.setItem($storage.key.wallpaper, JSON.stringify(items));

            result = items;
            return result
        }
    // UserGallery End.
    }

    // Storage for Photo cache storage
    else if (label === 'cached_img')
    {
        /*
         * Getter
         */
        if (method === 'get')
        {
            items = window.localStorage.getItem('SNT_cached_wallpapers_url');
            if(items){
                result = items.split(',');
            }
            return result;
        }

        /*
         * Setter
         */
        else if (method === 'set')
        {
            window.localStorage.setItem('SNT_cached_wallpapers_url', item);
            result = item;
            return result
        }
    }

};