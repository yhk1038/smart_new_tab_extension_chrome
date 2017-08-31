
function AppStorage() {
    this.key = {
        todo: 'SNT_TD_ITEMS'
    }
}

AppStorage.prototype.mapper_array = function (method, resource) {
    if (method === 'unlock')
    {
        //
    }

    else if (method === 'lock')
    {
        //
    }
};

AppStorage.prototype.mapper_hash = function (method, resource) {
    var result;

    if (method === 'unlock')
    {
        var arr = [];
        var arr2 = resource.split('{');
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
        return arr
    }

    else if (method === 'lock')
    {
        var arr3 = [];
        $.each(resource, function (j, obj) {
            arr3.push(JSON.stringify(obj));
        });
        return arr3
    }

    return result;
};