// 전체화면 토글 기능
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // 전체화면 버튼 생성
        const btn = document.createElement('button');
        btn.id = 'fullscreenBtn';
        btn.className = 'fullscreen-btn';
        btn.innerHTML = '⛶';
        btn.title = '전체화면';
        btn.addEventListener('click', toggleFullscreen);
        document.body.appendChild(btn);

        // 전체화면 변경 이벤트 리스너
        document.addEventListener('fullscreenchange', updateButton);
        document.addEventListener('webkitfullscreenchange', updateButton);
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    function updateButton() {
        const btn = document.getElementById('fullscreenBtn');
        if (!btn) return;
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            btn.innerHTML = '⛶';
            btn.title = '전체화면 종료';
            btn.classList.add('is-fullscreen');
        } else {
            btn.innerHTML = '⛶';
            btn.title = '전체화면';
            btn.classList.remove('is-fullscreen');
        }
    }
})();
