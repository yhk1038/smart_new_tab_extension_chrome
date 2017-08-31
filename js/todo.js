$(document).ready(function () {
    if(checkLogin()){
        if (get_todo_lists()){
            var todo_lists = load_todo_items();

            $.each(todo_lists, function (i, item) {
                if(item && item.id && item.content && (item.status !== undefined)){
                    var todo_item_dom = todo_item_dom_format(item.id, item.content, item.status);
                    $('.todo-body').append(todo_item_dom);
                }
            });
        }
        bindProgressBar();

        $('#todo-hideBtn').click(function () {
            todo($('.app[data-target="toDo"]'));
        });

        rebindTodoClickListener();
        rebindTodoDeleteClickListener();

        $('.todo-insert-input').keyup(function (e) {
            var value = $(this).val().trim();

            if (value.length > 0){
                if (e.keyCode === 13){
                    var last_num = 1;
                    if (get_todo_lists()){
                        var lists = get_todo_lists();
                        last_num = lists[lists.length -1].id + 1;
                    }
                    var todo_item_dom = todo_item_dom_format(last_num, value, '');
                    $('.todo-body').append(todo_item_dom);
                    $(this).val('');

                    var item = {id: last_num, content: value, status: false};
                    set_todo_items(item);

                    rebindTodoClickListener();
                    rebindTodoDeleteClickListener();
                    bindProgressBar();
                }
            }
        });
    }
});

function bindProgressBar() {
    var items = $('.todo-body').find('.todo-item');
    var i = items.length * 1.0;
    var etems = $('.todo-body').find('.finished');
    var e = etems.length * 1.0;

    var j = (e/i) * 100;
    if (isNaN(j) || e === 0 || i === 0){
        j = 0;
    }
    j = j.toFixed(1);
    var percent = j+'%';

    $('.todo-progressbar .meter').html(
        '<span style="width: '+percent+'"><span>'+percent+'</span></span>'
    );

    $('#todo-total').text('total '+items.length);
}

function rebindTodoClickListener() {
    $('.todo-item').unbind().click(function () {
        var checkBox = $(this).find('input[type="checkbox"]');
        var item = $(this);
        var changed_item = {};

        if (item.attr('class').split(' ').indexOf('finished') === -1){
            // 체크되지 않은 상태면, 체크를 해주고
            checkBox.attr('checked', 'checked');
            changed_item = {id: parseInt(item.attr('id').split('todo-item-')[1]), content: item.text().replace(' x ','').trim(), status: 'finished'};
            update_toto_store(changed_item);
        } else {
            // 체크된 상태면, 체크를 해제한다.
            checkBox.removeAttr('checked');
            changed_item = {id: parseInt(item.attr('id').split('todo-item-')[1]), content: item.text().replace(' x ','').trim(), status: false};
            update_toto_store(changed_item);
        }
        item.toggleClass('finished');
        bindProgressBar();
    });
}

function rebindTodoDeleteClickListener() {
    $('.todo-item-delete').unbind().click(function (e) {
        var item = $(this).closest('.todo-item');
        var changed_item = {id: parseInt(item.attr('id').split('todo-item-')[1]), content: item.text().replace(' x ','').trim(), status: false};

        remove_todo_store(changed_item);
        item.remove();

        bindProgressBar();
        e.stopPropagation();
    });
}

function todo(btn) {
    btn.toggleClass('open');
    var ground = $('#todo-content');
    ground.toggleClass('open');

    todayfill();
    setTimeout(function(){todayfill()}, 1000);
}

function todayfill() {
    var todayTime = $('#todo-content').find('.todo-today');
    var date = new Date;
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) { mm = '0'+mm }

    var dd = date.getDate();
    if (dd < 10) { dd = '0'+dd }

    var today = yy+'-'+mm+'-'+dd;
    todayTime.text(today);
}

function todo_item_dom_format(id, txt, status) {
    var is_done = '';
    var checked = '';
    if (status === 'finished'){
        is_done = 'finished';
        checked = 'checked';
    }
    var dom = '' +
        '<p class="todo-item '+is_done+'" id="todo-item-'+id+'"><input type="checkbox" '+checked+'> '+txt+' <span class="todo-item-delete" id="todo-item-delete-'+id+'"> x </span></p>' +
        '';
    return dom;
}

function load_todo_items() {
    return get_todo_lists();
}
function get_todo_lists() {
    var result;
    var arr = [];
    if (window.localStorage.getItem('SNT_TD_ITEMS')){
        var arr2 = window.localStorage.getItem('SNT_TD_ITEMS').split('{');
        $.each(arr2, function (i, str) {
            if (str.indexOf('}') !== -1){
                str = str.split('}')[0];
                str = '{'+str+'}';
                arr.push(JSON.parse(str));
            }
        });
        arr.sort(function (a, b) {
            return (a.id - b.id);
        });
        result = arr;
        //console.log(result);
    }
    return result;
}
function set_todo_items(item) {
    var todo_lists = [];
    var json = [];

    if (item && item.id && item.content && (item.status !== undefined)){
        if (get_todo_lists()){
            todo_lists = get_todo_lists();
        }

        todo_lists.push(item);
        $.each(todo_lists, function (j, obj) {
            json.push(JSON.stringify(obj));
        });

        window.localStorage.setItem('SNT_TD_ITEMS', json);
    }
}
function update_toto_store(item) {
    var todo_lists = [];
    var json = [];

    if (item && item.id && item.content && (item.status !== undefined)){
        if (get_todo_lists()){
            todo_lists = get_todo_lists();
        }

        $.each(todo_lists, function (i, obj) {
            if (obj.id === item.id){
                todo_lists.splice(todo_lists.indexOf(obj), 1);
                todo_lists.push(item);
            }
        });
        $.each(todo_lists, function (j, obj) {
            json.push(JSON.stringify(obj));
        });
        window.localStorage.setItem('SNT_TD_ITEMS', json);
    }
}
function remove_todo_store(item) {
    var todo_lists = [];
    var json = [];

    if (get_todo_lists()){
        todo_lists = get_todo_lists();
    }

    $.each(todo_lists, function (i, obj) {
        if (obj && item && (obj.id === item.id) && obj.content === item.content){
            todo_lists.splice(todo_lists.indexOf(obj), 1);
        }
    });
    $.each(todo_lists, function (j, obj) {
        json.push(JSON.stringify(obj));
    });
    window.localStorage.setItem('SNT_TD_ITEMS', json);
}