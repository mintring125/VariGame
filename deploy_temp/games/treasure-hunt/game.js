// 게임 상태
let currentPlayer = 1;
let scores = [0, 0];
let flippedCount = 0;
let tiles = [];

// 보물 정의
const treasures = [
    { type: 'apple', emoji: '🍎', points: 1, count: 6, class: 'apple', effect: '맛있어! 🍎' },
    { type: 'orange', emoji: '🍊', points: 1, count: 5, class: 'orange', effect: '상큼해! 🍊' },
    { type: 'star', emoji: '⭐', points: 2, count: 4, class: 'star', effect: '반짝! ⭐' },
    { type: 'diamond', emoji: '💎', points: 3, count: 3, class: 'diamond', effect: '빛나! 💎' },
    { type: 'crown', emoji: '👑', points: 5, count: 2, class: 'crown', effect: '대박! 👑' },
    { type: 'bomb', emoji: '💣', points: -2, count: 4, class: 'bomb', effect: '펑! 💣' },
    { type: 'empty', emoji: '', points: 0, count: 12, class: 'empty', effect: '꽝...' }
];

// 게임 초기화
function initGame() {
    currentPlayer = 1;
    scores = [0, 0];
    flippedCount = 0;
    tiles = generateTiles();

    updateScoreboard();
    renderBoard();
}

// 타일 생성 (보물 랜덤 배치)
function generateTiles() {
    const allTiles = [];

    treasures.forEach(treasure => {
        for (let i = 0; i < treasure.count; i++) {
            allTiles.push({ ...treasure });
        }
    });

    // Fisher-Yates 셔플
    for (let i = allTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }

    return allTiles;
}

// 보드 렌더링
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    tiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.dataset.index = index;
        tileElement.addEventListener('click', () => flipTile(index));

        board.appendChild(tileElement);
    });
}

// 타일 뒤집기
function flipTile(index) {
    const tileElement = document.querySelector(`.tile[data-index="${index}"]`);

    if (tileElement.classList.contains('flipped')) {
        return;
    }

    const treasure = tiles[index];

    // 타일 뒤집기 애니메이션
    tileElement.classList.add('flipped');
    tileElement.classList.add(treasure.class);

    // 보물 표시
    setTimeout(() => {
        const treasureElement = document.createElement('div');
        treasureElement.className = 'treasure';
        treasureElement.textContent = treasure.emoji;
        tileElement.appendChild(treasureElement);

        // 효과 표시
        showEffect(treasure.effect);

        // 점수 업데이트
        scores[currentPlayer - 1] += treasure.points;
        updateScoreboard();

        flippedCount++;

        // 게임 종료 체크
        if (flippedCount === 36) {
            setTimeout(() => endGame(), 1000);
        } else {
            // 다음 플레이어로 전환
            setTimeout(() => {
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updateScoreboard();
            }, 800);
        }
    }, 300);
}

// 효과 표시
function showEffect(text) {
    const effect = document.createElement('div');
    effect.className = 'effect-overlay';
    effect.textContent = text;
    document.body.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1000);
}

// 점수판 업데이트
function updateScoreboard() {
    document.getElementById('score1').textContent = `${scores[0]}점`;
    document.getElementById('score2').textContent = `${scores[1]}점`;

    const turnIndicator = document.getElementById('turnIndicator');
    if (flippedCount < 36) {
        turnIndicator.textContent = currentPlayer === 1 ? '부엉이 차례' : '샐리 차례';
    }
}

// 게임 종료
function endGame() {
    const modal = document.getElementById('victoryModal');
    const winnerText = document.getElementById('winnerText');
    const finalScore = document.getElementById('finalScore');

    let winner;
    if (scores[0] > scores[1]) {
        winner = 'celeste';
        winnerText.textContent = '🎉 부엉이 승리! 🎉';
    } else if (scores[1] > scores[0]) {
        winner = 'sally';
        winnerText.textContent = '🎉 샐리 승리! 🎉';
    } else {
        winner = null;
        winnerText.textContent = '🤝 무승부! 🤝';
    }

    finalScore.textContent = `부엉이: ${scores[0]}점 | 샐리: ${scores[1]}점`;

    modal.classList.add('show');

    // 승리 영상 표시 (무승부가 아닐 때만)
    if (winner && typeof showVictoryVideo === 'function') {
        setTimeout(() => {
            showVictoryVideo(winner);
        }, 500);
    }
}

// 게임 재시작
function restartGame() {
    const modal = document.getElementById('victoryModal');
    modal.classList.remove('show');
    initGame();
}

// 페이지 로드 시 게임 시작
document.addEventListener('DOMContentLoaded', initGame);
