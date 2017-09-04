// Setting module

/*
 * Interval
 */

$per_sec    = 1000;
$per_min    = $per_sec * 60;
$per_hour   = $per_min * 60;
$per_day    = $per_hour * 24;

$interval_background_image  = 1 * $per_min; // 배경전환 interval
$interval_update_photo_urls = 30 * $per_min; // url 스토리지 업데이트 interval
$interval_update_photo_preview = 10 * $per_sec; // 배경 이미지 미리보기 interval


/*
 * Default
 */

$default_img_path = './imgs/wallpaper/' + 'momentum_bgimg_1.jpg';