$system_clock = new Timer();

/*
 * Define Timer Class
 * methods:
 *  this.run(target)
 */

function Timer () {
    // this.interval = $per_min;
}

Timer.prototype.run = function (target) {
    if (target === 'time_stamp'){
        // 타임스탬프 ui 셋업
        var height = window.screen.height;
        var timeStamp = $('#time-stamp');
        timeStamp.css('top', (height / 2 - 180)+'px');

        // 타이머 즉시 실행
        tictok();
    }

    // else if () {} ...
};


/*
 * Namespace functions
 *
 * 클래스 메서드로 만들면 클래스를 무한히 생성하게 되므로
 * 네임스페이스 형태로 바깥에 두도록 한다
 */

// Infinite timer
// 메인 시계에 쓰인다.
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

    var current_time = currentHours+':'+currentMinute;

    var binding_ground = document.getElementById('time-stamp').getElementsByClassName('stamp-size')[0];
    binding_ground.innerText = current_time;

    setTimeout(function(){tictok()}, 1000);
}

// Limited timer
// 시간을 잴 때 쓰려고 만들어뒀다. 아직 안쓰이고 있음. (쓰이기 시작하면 변경할 것)
// ex. var interval = 4 * $per_min; limited_tictok(interval);
function limited_tictok(interval) {
    interval -= $per_sec;

    if (count >= 0){
        // still loop ...
        setTimeout(function(){
            limited_tictok(interval)
        }, $per_sec);
    }

    else {
        // end point codes here ...
        console.log('finished');
    }
}