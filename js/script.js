// Initialize AOS (Animation On Scroll)
AOS.init({
    duration: 1200,
    once: true
});

// Kakao Map Initialization
document.addEventListener('DOMContentLoaded', function() {
    var mapContainer = document.getElementById('map');

    // Coordinates for Saint Maries Gangnam (Approximate via Bangbae Station vicinity as requested)
    var venueCoords = new kakao.maps.LatLng(37.4816, 126.9976);

    var mapOptions = {
        center: venueCoords,
        level: 3
    };

    var map = new kakao.maps.Map(mapContainer, mapOptions);

    // Marker
    var marker = new kakao.maps.Marker({
        position: venueCoords
    });
    marker.setMap(map);

    // Zoom Control
    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // Load Guestbook
    loadGuestbook();
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

// --- RSVP Logic ---
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('rsvp-name').value;
        const phone = document.getElementById('rsvp-phone').value;
        const attendance = document.querySelector('input[name="attendance"]:checked').value;
        const meal = document.querySelector('input[name="meal"]:checked').value;

        const newRSVP = {
            id: Date.now(),
            name: name,
            phone: phone,
            attendance: attendance,
            meal: meal,
            date: new Date().toLocaleString()
        };

        const rsvpList = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
        rsvpList.push(newRSVP);
        localStorage.setItem('wedding_rsvp', JSON.stringify(rsvpList));

        alert('소중한 마음 감사합니다.\n참석 여부가 전달되었습니다.');
        rsvpForm.reset();
    });
}

// --- Guestbook Logic ---
const guestbookForm = document.getElementById('guestbook-form');
const guestbookListElem = document.getElementById('guestbook-list');

if (guestbookForm) {
    guestbookForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('guest-name').value;
        const message = document.getElementById('guest-message').value;

        const newEntry = {
            id: Date.now(),
            name: name,
            message: message,
            date: new Date().toLocaleDateString()
        };

        const gbList = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
        gbList.unshift(newEntry); // Add to top
        localStorage.setItem('wedding_guestbook', JSON.stringify(gbList));

        renderGuestbookItem(newEntry);
        guestbookForm.reset();
    });
}

function loadGuestbook() {
    const gbList = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
    if (guestbookListElem) {
        guestbookListElem.innerHTML = '';
        // Render from oldest to newest because renderGuestbookItem prepends (puts at top)
        // This ensures the final list is [Newest, ..., Oldest]
        gbList.slice().reverse().forEach(entry => renderGuestbookItem(entry));
    }
}

function renderGuestbookItem(entry) {
    if (!guestbookListElem) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'guestbook-item';
    itemDiv.setAttribute('data-aos', 'fade-up');

    itemDiv.innerHTML = `
        <div class="name">${entry.name}</div>
        <div class="message">${entry.message}</div>
        <div class="date">${entry.date}</div>
    `;

    // If prepending to list
    if (guestbookListElem.firstChild) {
        guestbookListElem.insertBefore(itemDiv, guestbookListElem.firstChild);
    } else {
        guestbookListElem.appendChild(itemDiv);
    }
}

// --- Admin Trigger (Hidden) ---
const adminTrigger = document.getElementById('admin-trigger');
let clickCount = 0;
let clickTimer;

if (adminTrigger) {
    adminTrigger.addEventListener('click', function() {
        clickCount++;
        clearTimeout(clickTimer);

        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 2000); // Reset if not clicked 5 times within 2 seconds

        if (clickCount >= 5) {
            const rsvpData = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
            console.log("=== RSVP LIST ===");
            console.table(rsvpData);
            alert(`총 ${rsvpData.length}명의 응답이 있습니다.\n(개발자 도구 Console을 확인하세요)`);
            clickCount = 0;
        }
    });
}
