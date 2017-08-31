$to_do = new Todo();

$(document).ready(function () {
    if(checkLogin()){
        $to_do.build_template();

        $('.todo-insert-input').keyup(function (e) {
            var value = $(this).val().trim();

            if (value.length > 0){
                if (e.keyCode === 13){
                    var last_num = 1;
                    var lists = $to_do.storage('index', null);
                    if (lists){
                        last_num = lists[lists.length -1].id + 1;
                    }
                    var todo_item_dom = this.format.todo_item(last_num, value, '');
                    $('.todo-body').append(todo_item_dom);
                    $(this).val('');

                    var item = {id: last_num, content: value, status: false};
                    $to_do.storage('create', item);
                    $to_do.rebind();
                }
            }
        });
    }
});

/*
 * Namespace functions
 *
 * 클래스 메서드로 만들면 클래스를 무한히 생성하게 되므로
 * 네임스페이스 형태로 바깥에 두도록 한다
 */

function set_date () {
    var todayTime = $('#todo-content').find('.todo-today');
    var date = new Date;
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) { mm = '0'+mm }

    var dd = date.getDate();
    if (dd < 10) { dd = '0'+dd }

    var today = yy+'-'+mm+'-'+dd;
    todayTime.text(today);

    setTimeout(function(){this.set_date()}, $per_sec);
}

/*
 * Define To-do Class
 * methods:
 *
 * refactoring:
 *      1. storage Logic 정리 [Restful] (mapper 분리 포함)
 *      2. rebind Logic 정리
 *      3. format / template / simple function 추려 모으고 인터페이스 정리
 *      4. UI Build Logic 정리
 *      5. etc.
 */

function Todo() {

    this.toggle = function (btn) {
        btn.toggleClass('open');
        $('#todo-content').toggleClass('open');
    };

    this.record_scheme = function (item, status) {
        return ({id: parseInt(item.attr('id').split('todo-item-')[1]), content: item.text().replace(' x ','').trim(), status: status})
    };

    this.format = {
        progress_bar: function (percent) {
            return ('<span style="width: '+percent+'"><span>'+percent+'</span></span>')
        },

        todo_item: function (id, txt, status) {
            var is_done = ''; var checked = '';
            if (status === 'finished'){ is_done = 'finished'; checked = 'checked'; }
            return '<p class="todo-item '+is_done+'" id="todo-item-'+id+'">' +
                        '<input type="checkbox" '+checked+'> ' +
                            ''+txt+' ' +
                        '<span class="todo-item-delete" id="todo-item-delete-'+id+'"> x </span>' +
                    '</p>';
        }
    };

    // 레코드 유효성 검증
    this.item_valid = function (item) {
        if (!item){return false}
        if (!item.id){return false}
        if (item.status === undefined){return false}
        return item
    };
}




/*
 * [UI element] To Do Items
 *
 * 페이지 로딩이 완료되었을 때 한 번 실행
 */

Todo.prototype.build_template = function () {
    var todo_lists = this.storage('index', null);
    if (todo_lists){
        $.each(todo_lists, function (i, item) {
            if(this.item_valid(item)){
                var todo_item_dom = this.format.todo_item(item.id, item.content, item.status);
                $('.todo-body').append(todo_item_dom);
            }
        });
    }
    this.rebind();
    set_date();

    $('#todo-hideBtn').click(function () {
        this.toggle($('.app[data-target="toDo"]'));
    });
};


/*
 * [UI element] Progress Bar
 *
 *      bind_progress_bar   (public)
 *        ㄴ> set_progress   (private)
 */

Todo.prototype.bind_progress_bar = function () {
    var body = $('.todo-body');
    var items = body.find('.todo-item'); // 전체 할일
    var etems = body.find('.finished'); // 끝난 일

    this.set_progress(items, etems);
};

Todo.prototype.set_progress = function (total, finished) { // bind_progress_bar 에 의무적으로 종속
    var i = total.length; var e = finished.length;
    i *= 1.0; e *= 1.0;

    // 진행률을 계산
    var j = (e/i) * 100;
    if (isNaN(j) || e === 0 || i === 0){
        j = 0;
    }
    j = j.toFixed(1); // 소숫점 이하 1째 자리까지 표현
    var percent = j+'%';

    // Ui 에 반영
    $('.todo-progressbar .meter').html( this.format.progress_bar(percent) );
    $('#todo-total').text('total '+total.length);
};




/*
 * Rebind Event Listener for Template changing
 *
 *      1. item onclick listener
 *      2. delete button onclick listener
 */

Todo.prototype.rebind = function(){
    /*
     * item_click: function () {
     */
        $('.todo-item').unbind().click(function () {
            // # 1. 리소스 가져오기
            var checkBox = $(this).find('input[type="checkbox"]');
            var item = $(this);
            var changed_item = {};

            // # 2. 필요한 상태로 만들기위한 연산
            if (item.attr('class').split(' ').indexOf('finished') === -1){
                // 체크되지 않은 상태면, 체크를 해주고
                checkBox.attr('checked', 'checked');
                changed_item = this.record_scheme(item, 'finished');

            } else {
                // 체크된 상태면, 체크를 해제한다.
                checkBox.removeAttr('checked');
                changed_item = this.record_scheme(item, false);

            }

            // # 3. 데이터 및 시각요소에 반영
            this.storage('update', changed_item); // 스토리지에 데이터 반영
            item.toggleClass('finished'); // ui 에 상태 반영

            // # 4. 반영 후 후속처리
            this.bind_progress_bar(); // 후속 바인딩
        });
    // },

    /*
     * delete_button: function () {
     */
        $('.todo-item-delete').unbind().click(function (e) {
            // # 1.
            var item = $(this).closest('.todo-item');
            var delete_item = this.record_scheme(item, false);

            // # 2 + 3
            this.storage('destroy', delete_item);
            item.remove();

            // # 4.
            this.bind_progress_bar();
            e.stopPropagation();
        });
    // }
};




/*
 * Methods for [ Restful Storage ]
 */

Todo.prototype.storage = function (method, item) {
    var result;
    var arr; var arr2; var items;

    /*
     *  Index
     */
    if (method === 'index')
    {   // get_todo_lists!()
        var res = window.localStorage.getItem($storage.key.todo);
        if (res){
            result = $storage.mapper_hash('unlock', res);
        }
        return result
    }

    /*
     *  Show
     */
    // else if (method === 'show')
    // {}

    /*
     *  Create
     */
    else if (method === 'create' && item)
    {   // set_todo_items(item)
        
        // 저장 하기 전에 무결한 데이터인지 점검
        if (this.item_valid(item)){
            arr = [];
            arr2 = [];
            
            // 기존 데이터들의 리스트를 가져온다 (풀려있는 상태)
            items = this.storage('index', null); // typeOf(items) == Array
            if (items) { arr = items }

            // 데이터셋에 아이템을 하나 집어넣음
            arr.push(item);

            // json 으로 다시 잠그고 스토리지에 덮어씀
            arr2 = $storage.mapper_hash('lock', arr);
            window.localStorage.setItem($storage.key.todo, arr2);
            result = arr;
        }
        return result
    }

    /*
     *  Update
     */
    else if (method === 'update' && item)
    {   // update_todo_store(item)

        // 저장 하기 전에 무결한 데이터인지 점검
        if (this.item_valid(item)){
            arr = [];
            arr2 = [];

            // 기존 데이터들의 리스트를 가져온다 (풀려있는 상태)
            items = this.storage('index', null); // typeOf(items) == Array
            if (items) { arr = items }

            // 가져온 데이터셋에서
            $.each(arr, function (i, obj) {
                if (obj.id === item.id){
                    // 수정하려는 데이터를 찾아 지우고
                    arr.splice(arr.indexOf(obj), 1);

                    // 수정된 데이터를 집어넣음
                    arr.push(item);
                }
            });

            // json 으로 다시 잠그고 스토리지에 덮어씀
            arr2 = $storage.mapper_hash('lock', arr);
            window.localStorage.setItem($storage.key.todo, arr2);
        }
        return result
    }

    /*
     *  Destroy
     */
    else if (method === 'destroy' && item)
    {   // remove_todo_store(item)

        // 신뢰성은 후반에 검증하므로 무결성 체크 생략
        arr = [];
        arr2 = [];

        // 기존 데이터들의 리스트를 가져온다 (풀려있는 상태)
        items = this.storage('index', null); // typeOf(items) == Array
        if (items) { arr = items }

        // 가져온 데이터셋에서
        $.each(arr, function (i, obj) {
            if (obj && item && (obj.id === item.id) && obj.content === item.content){
                // 지우려는 데이터를 찾아 지움
                // => 완전일치해야 삭제할 바로 그 데이터로 신뢰할 수 있음
                arr.splice(arr.indexOf(obj), 1);
            }
        });

        // json 으로 다시 잠그고 스토리지에 덮어씀
        arr2 = $storage.mapper_hash('lock', arr);
        window.localStorage.setItem($storage.key.todo, arr2);
    }

    return result;
};







/*
 * ! Archived Functions !
 */

// function get_todo_lists(){
//     var result;
//     var arr = [];
//     if (window.localStorage.getItem('SNT_TD_ITEMS')){
//         var arr2 = window.localStorage.getItem('SNT_TD_ITEMS').split('{');
//         $.each(arr2, function (i, str) {
//             if (str.indexOf('}') !== -1){
//                 str = str.split('}')[0];
//                 str = '{'+str+'}';
//                 arr.push(JSON.parse(str));
//             }
//         });
//         arr.sort(function (a, b) {
//             return (a.id - b.id);
//         });
//         result = arr;
//     }
//     return result;
// }

// function set_todo_items(item) {
//     var todo_lists = [];
//     var json = [];
//
//     if (item && item.id && item.content && (item.status !== undefined)){
//         if ($to_do.storage('index', null)){
//             todo_lists = $to_do.storage('index', null);
//         }
//
//         todo_lists.push(item);
//         $.each(todo_lists, function (j, obj) {
//             json.push(JSON.stringify(obj));
//         });
//
//         window.localStorage.setItem('SNT_TD_ITEMS', json);
//     }
// }

// function update_todo_store(item) {
//     var todo_lists = [];
//     var json = [];
//
//     if (item && item.id && item.content && (item.status !== undefined)){
//         if ($to_do.storage('index', null)){
//             todo_lists = $to_do.storage('index', null);
//         }
//
//         $.each(todo_lists, function (i, obj) {
//             if (obj.id === item.id){
//                 todo_lists.splice(todo_lists.indexOf(obj), 1);
//                 todo_lists.push(item);
//             }
//         });
//         $.each(todo_lists, function (j, obj) {
//             json.push(JSON.stringify(obj));
//         });
//         window.localStorage.setItem('SNT_TD_ITEMS', json);
//     }
// }

// function remove_todo_store(item) {
//     var todo_lists = [];
//     var json = [];
//
//     if ($to_do.storage('index', null)){
//         todo_lists = $to_do.storage('index', null);
//     }
//
//     $.each(todo_lists, function (i, obj) {
//         if (obj && item && (obj.id === item.id) && obj.content === item.content){
//             todo_lists.splice(todo_lists.indexOf(obj), 1);
//         }
//     });
//     $.each(todo_lists, function (j, obj) {
//         json.push(JSON.stringify(obj));
//     });
//     window.localStorage.setItem('SNT_TD_ITEMS', json);
// }