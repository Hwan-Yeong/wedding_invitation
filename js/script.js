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
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const dDayText = document.getElementById('d-day-count');
        if (dDayText) dDayText.innerText = days;
    }

    setInterval(updateTimer, 1000);
    updateTimer();
}

/* --- 2. Kakao Map --- */
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Coordinates for Saint Maries Gangnam (Bangbae-dong 481-5)
    // Approx: 37.4795, 126.9855 (Using Sadang Station vicinity)
    // Let's refine based on the address: 서울특별시 서초구 남부순환로289길 5
    // This is close to Sadang Station Exit 13/14.
    // Confirmed coordinate for Saint Maries Gangnam: 37.479482, 126.985536
    const lat = 37.479482;
    const lng = 126.985536;

    // Update the links in HTML if necessary, or just rely on the map SDK

    // Check if Kakao is loaded
    if (typeof kakao === 'undefined' || !kakao.maps) {
        console.warn("Kakao Maps SDK not loaded.");
        mapContainer.innerHTML = "<div style='display:flex; align-items:center; justify-content:center; height:100%; text-align:center; color:#999; font-size:0.9rem; background:#eee;'>지도를 불러오는 중 오류가 발생했거나,<br>도메인 등록이 필요합니다.</div>";
        return;
    }

    try {
        const mapOption = {
            center: new kakao.maps.LatLng(lat, lng),
            level: 4
        };

        const map = new kakao.maps.Map(mapContainer, mapOption);

        const markerPosition  = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);

        const iwContent = '<div style="padding:10px; text-align:center; font-size:0.8rem; width:150px;"><strong>세인트메리스 강남</strong><br><a href="https://map.kakao.com/link/to/세인트메리스강남,' + lat + ',' + lng + '" style="color:blue" target="_blank">길찾기</a></div>';
        const infowindow = new kakao.maps.InfoWindow({ content : iwContent });
        infowindow.open(map, marker);

    } catch (e) {
        console.error("Kakao Map failed to load:", e);
        mapContainer.innerHTML = "<div style='display:flex; align-items:center; justify-content:center; height:100%; text-align:center; color:#999;'>지도를 불러올 수 없습니다.</div>";
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

        // Check if window.db exists (Firebase)
        if (window.db) {
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
            // LocalStorage Fallback
            let rsvpList = JSON.parse(localStorage.getItem('rsvp_list') || '[]');
            rsvpList.push(data);
            localStorage.setItem('rsvp_list', JSON.stringify(rsvpList));

            alert("참석 의사가 전달되었습니다. (로컬 저장됨)");
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "참석 의사 전달하기";

            // Refresh admin panel if open
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel && adminPanel.style.display !== 'none') {
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
        li.style.marginBottom = "10px";
        li.style.paddingBottom = "10px";
        li.style.borderBottom = "1px solid #eee";

        // Safe DOM creation to prevent XSS
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = entry.name;

        const sideSpan = document.createElement('span');
        sideSpan.style.fontSize = '0.9em';
        sideSpan.style.color = '#666';
        sideSpan.textContent = ` (${entry.side === 'groom' ? '신랑측' : '신부측'})`;

        const countText = document.createTextNode(` - ${count}명`);

        const br1 = document.createElement('br');

        const mealText = document.createTextNode('식사여부: ');
        const mealSpan = document.createElement('span');
        if (entry.meal === 'yes') {
            mealSpan.style.color = 'green';
            mealSpan.textContent = '식사함';
        } else {
            mealSpan.style.color = 'red';
            mealSpan.textContent = '식사안함';
        }

        const br2 = document.createElement('br');

        const dateSpan = document.createElement('span');
        dateSpan.style.fontSize = '0.75em';
        dateSpan.style.color = '#999';
        dateSpan.textContent = new Date(entry.date).toLocaleString();

        li.appendChild(nameStrong);
        li.appendChild(sideSpan);
        li.appendChild(countText);
        li.appendChild(br1);
        li.appendChild(mealText);
        li.appendChild(mealSpan);
        li.appendChild(br2);
        li.appendChild(dateSpan);

        listElement.appendChild(li);

        if (entry.side === 'groom') groomCount += count;
        else brideCount += count;

        if (entry.meal === 'yes') mealCount += count;
    });

    const stats = document.createElement('div');
    stats.style.marginBottom = '1rem';
    stats.style.padding = '10px';
    stats.style.backgroundColor = '#f9f9f9';
    stats.style.borderRadius = '4px';
    stats.style.fontSize = '0.9rem';
    stats.innerHTML = `
        <strong>전체 인원: ${totalGuests}명</strong> (신랑측: ${groomCount} / 신부측: ${brideCount}) <br>
        식사 예정: ${mealCount}명
    `;

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
    div.className = 'gb-entry';

    // Create elements safely
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = entry.name;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'msg';
    msgSpan.textContent = entry.message;

    const dateDiv = document.createElement('div');
    dateDiv.style.fontSize = '0.7em';
    dateDiv.style.color = '#ccc';
    dateDiv.style.textAlign = 'right';
    dateDiv.style.marginTop = '5px';
    dateDiv.textContent = new Date(entry.date).toLocaleDateString();

    div.appendChild(nameSpan);
    div.appendChild(msgSpan);
    div.appendChild(dateDiv);

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
    alert("청첩장 링크가 복사되었습니다!");
}
window.copyLink = copyLink;

function shareKakao() {
    // Requires Kakao JavaScript Key in HTML and domain registration
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            Kakao.init('ad5b8e77dd5d4e2d29139b67a7dafc72'); // Using the key from HTML
        }

        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '조환영 & 윤지원 결혼합니다',
                description: '2026년 9월 5일 토요일 오후 6시 30분, 세인트메리스 강남',
                imageUrl: window.location.origin + '/assets/images/hero.jpg', // Needs absolute URL
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: '청첩장 보기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        });
    } else {
        alert("카카오톡 공유 기능을 사용할 수 없습니다. 링크 복사를 이용해주세요.");
    }
}
window.shareKakao = shareKakao;
