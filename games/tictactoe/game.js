// 게임 상태
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'O'; // O = 부엉이 (player1), X = 샐리 (player2)
let gameActive = true;

// 승리 조건 (가로, 세로, 대각선)
const winningConditions = [
    [0, 1, 2], // 첫 번째 가로
    [3, 4, 5], // 두 번째 가로
    [6, 7, 8], // 세 번째 가로
    [0, 3, 6], // 첫 번째 세로
    [1, 4, 7], // 두 번째 세로
    [2, 5, 8], // 세 번째 세로
    [0, 4, 8], // 대각선 (왼쪽 위 → 오른쪽 아래)
    [2, 4, 6]  // 대각선 (오른쪽 위 → 왼쪽 아래)
];

// DOM 요소
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const player1Element = document.getElementById('player1');
const player2Element = document.getElementById('player2');
const turnIndicator = document.getElementById('turnIndicator');
const currentPlayerSpan = document.getElementById('currentPlayer');

// 셀 클릭 이벤트
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// 다시 시작 버튼
restartBtn.addEventListener('click', restartGame);

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // 이미 채워진 칸이거나 게임이 끝났으면 무시
    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // 칸에 표시하기
    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('taken');

    if (currentPlayer === 'O') {
        clickedCell.classList.add('player1');
    } else {
        clickedCell.classList.add('player2');
    }

    // 승리 확인
    checkWinner();
}

function checkWinner() {
    let roundWon = false;
    let winningLine = null;

    // 모든 승리 조건 체크
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];

        if (board[a] === '' || board[b] === '' || board[c] === '') {
            continue;
        }

        if (board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWinningLine(winningLine);

        setTimeout(() => {
            const winner = currentPlayer === 'O' ? 'celeste' : 'sally';
            const winnerName = currentPlayer === 'O' ? '부엉이' : '샐리';
            const winnerEmoji = currentPlayer === 'O' ? '🦉' : '🐿️';

            showVictoryVideo(winner);

            const winnerText = document.getElementById('winnerText');
            const winnerMessage = document.getElementById('winnerMessage');

            winnerText.textContent = `🎉 ${winnerName} 승리! 🎉`;
            winnerMessage.textContent = `축하합니다! ${winnerEmoji} ${winnerName}이(가) 이겼어요!`;

            document.getElementById('victoryModal').classList.add('active');
        }, 1000);

        return;
    }

    // 무승부 체크
    if (!board.includes('')) {
        gameActive = false;

        setTimeout(() => {
            const winnerText = document.getElementById('winnerText');
            const winnerMessage = document.getElementById('winnerMessage');

            winnerText.textContent = '🤝 무승부! 🤝';
            winnerMessage.textContent = '모든 칸이 찼어요! 다시 한 번 해볼까요?';

            document.getElementById('victoryModal').classList.add('active');
        }, 500);

        return;
    }

    // 다음 플레이어로 턴 변경
    switchPlayer();
}

function highlightWinningLine(winningLine) {
    winningLine.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'O' ? 'X' : 'O';

    // 플레이어 활성화 표시 전환
    if (currentPlayer === 'O') {
        player1Element.classList.add('active');
        player2Element.classList.remove('active');
        currentPlayerSpan.textContent = '부엉이';
        turnIndicator.innerHTML = '<span id="currentPlayer">부엉이</span>의 차례입니다! ⭕';
    } else {
        player1Element.classList.remove('active');
        player2Element.classList.add('active');
        currentPlayerSpan.textContent = '샐리';
        turnIndicator.innerHTML = '<span id="currentPlayer">샐리</span>의 차례입니다! ❌';
    }
}

function restartGame() {
    // 게임 상태 초기화
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'O';
    gameActive = true;

    // 셀 초기화
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'player1', 'player2', 'winning');
    });

    // 플레이어 표시 초기화
    player1Element.classList.add('active');
    player2Element.classList.remove('active');
    currentPlayerSpan.textContent = '부엉이';
    turnIndicator.innerHTML = '<span id="currentPlayer">부엉이</span>의 차례입니다! ⭕';

    // 모달 닫기
    document.getElementById('victoryModal').classList.remove('active');
}

// 초기 로드 시 부엉이가 시작
player1Element.classList.add('active');
