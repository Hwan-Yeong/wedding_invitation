document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initMap();
    initRSVP();
    initGuestbook();
});

/* --- 1. Countdown Timer --- */
function initCountdown() {
    const targetDate = new Date('2026-09-05T18:30:00').getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('d-day-count').innerText = "0";
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dDayText = document.getElementById('d-day-count');
        if (dDayText) dDayText.innerText = days;

        const dayEl = document.getElementById('days');
        const hourEl = document.getElementById('hours');
        const minEl = document.getElementById('minutes');
        const secEl = document.getElementById('seconds');

        if(dayEl) dayEl.innerText = String(days).padStart(2, '0');
        if(hourEl) hourEl.innerText = String(hours).padStart(2, '0');
        if(minEl) minEl.innerText = String(minutes).padStart(2, '0');
        if(secEl) secEl.innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateTimer, 1000);
    updateTimer();
}

/* --- 2. Kakao Map --- */
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Check if Kakao is loaded
    if (typeof kakao === 'undefined' || !kakao.maps) {
        console.warn("Kakao Maps SDK not loaded.");
        mapContainer.innerHTML = "<p style='text-align:center; padding: 2rem; color:#999; font-size:0.9rem;'>지도를 불러오는 중 오류가 발생했거나,<br>도메인 등록이 필요합니다.<br><br>아래 버튼을 이용해주세요.</p>";
        return;
    }

    try {
        const mapOption = {
            center: new kakao.maps.LatLng(37.4839, 127.0163),
            level: 3
        };

        const map = new kakao.maps.Map(mapContainer, mapOption);

        const markerPosition  = new kakao.maps.LatLng(37.4839, 127.0163);
        const marker = new kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);

        const iwContent = '<div style="padding:5px; text-align:center; font-size:0.8rem;">세인트메리스 강남 <br><a href="https://map.kakao.com/link/to/세인트메리스강남,37.4839,127.0163" style="color:blue" target="_blank">길찾기</a></div>';
        const infowindow = new kakao.maps.InfoWindow({ content : iwContent });
        infowindow.open(map, marker);

    } catch (e) {
        console.error("Kakao Map failed to load:", e);
        mapContainer.innerHTML = "<p style='text-align:center; padding: 2rem;'>지도를 불러올 수 없습니다.<br>아래 버튼을 이용해주세요.</p>";
    }
}

/* --- 3. RSVP --- */
function initRSVP() {
    const form = document.getElementById('rsvpForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = "전송 중...";

        const formData = new FormData(form);
        const data = {
            side: formData.get('side'),
            name: formData.get('name'),
            count: formData.get('count'),
            meal: formData.get('meal'),
            date: new Date().toISOString()
        };

        if (window.db) {
            // Firebase Mode
            window.db.collection('rsvp').add(data)
                .then(() => {
                    alert("참석 의사가 전달되었습니다. 감사합니다!");
                    form.reset();
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    alert("전송 중 오류가 발생했습니다.");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "참석 의사 전달하기";
                });
        } else {
            // LocalStorage Mode
            let rsvpList = JSON.parse(localStorage.getItem('rsvp_list') || '[]');
            rsvpList.push(data);
            localStorage.setItem('rsvp_list', JSON.stringify(rsvpList));

            alert("참석 의사가 전달되었습니다. (로컬 저장됨 - 설정 필요)");
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "참석 의사 전달하기";

            if (document.getElementById('adminPanel').style.display !== 'none') {
                renderAdminRSVP();
            }
        }
    });
}

function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        renderAdminRSVP();
    }
}
window.toggleAdmin = toggleAdmin;

function renderAdminRSVP() {
    const list = document.getElementById('rsvpList');
    if (!list) return;

    if (window.db) {
        list.innerHTML = '<li>데이터를 불러오는 중...</li>';
        window.db.collection("rsvp").orderBy("date", "desc").get().then((querySnapshot) => {
            const rsvpData = [];
            querySnapshot.forEach((doc) => {
                rsvpData.push(doc.data());
            });
            displayRSVPList(rsvpData, list);
        }).catch((error) => {
            list.innerHTML = `<li>Error: ${error.message}</li>`;
        });
    } else {
        const rsvpList = JSON.parse(localStorage.getItem('rsvp_list') || '[]');
        displayRSVPList(rsvpList, list);
    }
}

function displayRSVPList(data, listElement) {
    listElement.innerHTML = '';

    if (data.length === 0) {
        listElement.innerHTML = '<li>아직 등록된 참석자가 없습니다.</li>';
        return;
    }

    let groomCount = 0;
    let brideCount = 0;
    let mealCount = 0;
    let totalGuests = 0;

    data.forEach((entry) => {
        const count = parseInt(entry.count) || 1;
        totalGuests += count;

        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${entry.name}</strong> (${entry.side === 'groom' ? '신랑측' : '신부측'}) - ${count}명
            <br>식사: ${entry.meal === 'yes' ? 'O' : (entry.meal === 'no' ? 'X' : '?')}
            <span style="font-size:0.7em; color:#999">${new Date(entry.date).toLocaleString()}</span>
        `;
        listElement.appendChild(li);

        if (entry.side === 'groom') groomCount += count;
        else brideCount += count;

        if (entry.meal === 'yes') mealCount += count;
    });

    const stats = document.createElement('div');
    stats.style.marginBottom = '1rem';
    stats.style.fontWeight = 'bold';
    stats.innerHTML = `총 인원: ${totalGuests}명 (신랑측: ${groomCount}, 신부측: ${brideCount}) <br> 식사 예정: ${mealCount}명`;

    listElement.insertBefore(stats, listElement.firstChild);
}

/* --- 4. Guestbook --- */
function initGuestbook() {
    renderGuestbook();
}

function addGuestbookEntry() {
    const nameInput = document.getElementById('gbName');
    const msgInput = document.getElementById('gbMessage');

    const name = nameInput.value.trim();
    const message = msgInput.value.trim();

    if (!name || !message) {
        alert("이름과 메시지를 모두 입력해주세요.");
        return;
    }

    const entry = {
        name,
        message,
        date: new Date().toISOString()
    };

    if (window.db) {
        window.db.collection('guestbook').add(entry)
            .then(() => {
                nameInput.value = '';
                msgInput.value = '';
                // renderGuestbook handled by onSnapshot
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                alert("메시지 등록 실패");
            });
    } else {
        let gbList = JSON.parse(localStorage.getItem('guestbook_list') || '[]');
        gbList.unshift(entry);
        localStorage.setItem('guestbook_list', JSON.stringify(gbList));

        nameInput.value = '';
        msgInput.value = '';
        renderGuestbook();
    }
}
window.addGuestbookEntry = addGuestbookEntry;

function renderGuestbook() {
    const list = document.getElementById('guestbookList');
    if (!list) return;

    if (window.db) {
        // Real-time listener
        window.db.collection("guestbook").orderBy("date", "desc")
            .onSnapshot((querySnapshot) => {
                list.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const entry = doc.data();
                    appendGuestbookItem(list, entry);
                });
            });
    } else {
        const gbList = JSON.parse(localStorage.getItem('guestbook_list') || '[]');
        list.innerHTML = '';
        gbList.forEach(entry => {
            appendGuestbookItem(list, entry);
        });
    }
}

function appendGuestbookItem(list, entry) {
    const div = document.createElement('div');
    div.className = 'guestbook-entry';
    div.innerHTML = `
        <div class="name">${entry.name}</div>
        <div class="message">${entry.message}</div>
        <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
    `;
    list.appendChild(div);
}


/* --- 5. Share --- */
function copyLink() {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    alert("링크가 복사되었습니다!");
}
window.copyLink = copyLink;

function shareKakao() {
    alert("카카오톡 공유 기능은 실제 도메인과 카카오 개발자 계정 설정이 필요합니다.\n지금은 '링크 복사'를 이용해주세요.");
}
window.shareKakao = shareKakao;
