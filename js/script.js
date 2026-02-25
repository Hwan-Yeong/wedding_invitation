// Initialize AOS (Animation On Scroll)
AOS.init({
    duration: 1200,
    once: true
});

// Countdown Timer
function startCountdown() {
    // Target Date: 2026-09-05 18:30:00
    var countDate = new Date('September 5, 2026 18:30:00').getTime();

    var timer = setInterval(function() {
        var now = new Date().getTime();
        var gap = countDate - now;

        var second = 1000;
        var minute = second * 60;
        var hour = minute * 60;
        var day = hour * 24;

        if (gap < 0) {
            clearInterval(timer);
            document.getElementById('countdown').innerText = "결혼식이 진행 중이거나 종료되었습니다.";
            return;
        }

        var d = Math.floor(gap / day);
        var h = Math.floor((gap % day) / hour);
        var m = Math.floor((gap % hour) / minute);
        var s = Math.floor((gap % minute) / second);

        // Format with leading zeros
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;

        var countdownElem = document.getElementById('countdown');
        if (countdownElem) {
             countdownElem.innerText = d + "일 " + h + "시간 " + m + "분 " + s + "초";
        }

    }, 1000);
}

startCountdown();
