// Wallpaper Module
$(document).ready(function () {
    $('.card-closeBtn').click(function () {
        closeWallPaperProcess($('.app'));
    });
});

$wallpaper = new WallPaper();

function WallPaper() {
    this.toggle = function (btn, action) {
        if (action === 'open') { openWallPaperProcess(btn) }
        else if (action === 'close') { closeWallPaperProcess(btn) }
    }
}
