// 게임 상태
let currentPlayer = 1;
let positions = { 1: 1, 2: 1 };
let isRolling = false;
let canRollAgain = false;

// 뱀과 사다리 정의
const snakes = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    87: 24
};

const ladders = {
    2: 38,
    7: 14,
    8: 31,
    15: 26,
    28: 84,
    51: 67
};

// 보드 생성 (10x10, 하단 왼쪽부터 지그재그)
function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // 100부터 1까지 역순으로 생성 (화면상 위에서 아래로)
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            let cellNumber;

            // 지그재그 패턴
            if (row % 2 === 0) {
                // 짝수 행: 왼쪽에서 오른쪽
                cellNumber = row * 10 + col + 1;
            } else {
                // 홀수 행: 오른쪽에서 왼쪽
                cellNumber = row * 10 + (9 - col) + 1;
            }

            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${cellNumber}`;

            // 칸 번호 표시
            const cellNumberDiv = document.createElement('div');
            cellNumberDiv.className = 'cell-number';
            cellNumberDiv.textContent = cellNumber;
            cell.appendChild(cellNumberDiv);

            // 뱀 표시
            if (snakes[cellNumber]) {
                cell.classList.add('snake');
                cell.title = `뱀! ${cellNumber} → ${snakes[cellNumber]}`;
            }

            // 사다리 표시
            if (ladders[cellNumber]) {
                cell.classList.add('ladder');
                cell.title = `사다리! ${cellNumber} → ${ladders[cellNumber]}`;
            }

            board.appendChild(cell);
        }
    }

    // 초기 말 위치 표시
    updatePlayerPieces();
}

// 플레이어 말 업데이트
function updatePlayerPieces() {
    // 모든 말 제거
    document.querySelectorAll('.piece').forEach(p => p.remove());

    // 플레이어 1 말 추가
    const cell1 = document.getElementById(`cell-${positions[1]}`);
    const piece1 = document.createElement('div');
    piece1.className = 'piece player1';
    piece1.textContent = '🦉';
    cell1.appendChild(piece1);

    // 플레이어 2 말 추가
    const cell2 = document.getElementById(`cell-${positions[2]}`);
    const piece2 = document.createElement('div');
    piece2.className = 'piece player2';
    piece2.textContent = '🐱';
    cell2.appendChild(piece2);

    // 위치 표시 업데이트
    document.getElementById('pos1').textContent = positions[1];
    document.getElementById('pos2').textContent = positions[2];
}

// 주사위 굴리기
function rollDice() {
    if (isRolling) return;

    isRolling = true;
    const rollBtn = document.getElementById('rollBtn');
    const dice = document.getElementById('dice');
    const diceFace = dice.querySelector('.dice-face');

    rollBtn.disabled = true;
    dice.classList.add('rolling');

    // 주사위 애니메이션
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        diceFace.textContent = Math.floor(Math.random() * 6) + 1;
        rollCount++;

        if (rollCount >= 10) {
            clearInterval(rollInterval);
            dice.classList.remove('rolling');

            // 최종 주사위 값
            const diceValue = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = diceValue;

            // 말 이동
            setTimeout(() => {
                movePlayer(currentPlayer, diceValue);
            }, 500);
        }
    }, 100);
}

// 플레이어 이동
async function movePlayer(player, steps) {
    const startPos = positions[player];
    let targetPos = startPos + steps;

    // 100을 초과하면 이동하지 않음
    if (targetPos > 100) {
        showMessage('100을 딱 맞춰야 해요!');
        setTimeout(() => {
            nextTurn(steps);
        }, 1500);
        return;
    }

    // 칸별로 이동 애니메이션
    for (let i = 1; i <= steps; i++) {
        await sleep(300);
        positions[player] = startPos + i;
        updatePlayerPieces();
    }

    targetPos = positions[player];

    // 뱀 체크
    if (snakes[targetPos]) {
        await sleep(500);
        showMessage(`아이쿠! 뱀이다! 🐍 (${targetPos} → ${snakes[targetPos]})`);
        await sleep(1000);
        positions[player] = snakes[targetPos];
        updatePlayerPieces();
        await sleep(500);
    }

    // 사다리 체크
    if (ladders[targetPos]) {
        await sleep(500);
        showMessage(`사다리 타고 올라가자! 🪜 (${targetPos} → ${ladders[targetPos]})`);
        await sleep(1000);
        positions[player] = ladders[targetPos];
        updatePlayerPieces();
        await sleep(500);
    }

    // 승리 체크
    if (positions[player] === 100) {
        await sleep(500);
        gameOver(player);
        return;
    }

    // 6이 나오면 한 번 더
    if (steps === 6) {
        showMessage('6이 나왔어요! 한 번 더 굴려요! 🎲');
        canRollAgain = true;
        setTimeout(() => {
            isRolling = false;
            document.getElementById('rollBtn').disabled = false;
        }, 1500);
    } else {
        canRollAgain = false;
        nextTurn(steps);
    }
}

// 다음 턴
function nextTurn(lastRoll) {
    if (!canRollAgain) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }
    canRollAgain = false;

    updateTurnInfo();

    setTimeout(() => {
        isRolling = false;
        document.getElementById('rollBtn').disabled = false;
        showMessage('');
    }, 1500);
}

// 턴 정보 업데이트
function updateTurnInfo() {
    const player1Div = document.getElementById('player1');
    const player2Div = document.getElementById('player2');
    const turnInfo = document.getElementById('turnInfo');

    if (currentPlayer === 1) {
        player1Div.classList.add('active');
        player2Div.classList.remove('active');
        turnInfo.textContent = '부엉이 셀레스트 차례';
    } else {
        player1Div.classList.remove('active');
        player2Div.classList.add('active');
        turnInfo.textContent = '다람쥐 샐리 차례';
    }
}

// 메시지 표시
function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}

// 게임 종료
function gameOver(winner) {
    const modal = document.getElementById('victoryModal');
    const title = document.getElementById('victoryTitle');

    if (winner === 1) {
        title.textContent = '🦉 부엉이 셀레스트 승리! 🎉';
        showVictoryVideo('celeste');
    } else {
        title.textContent = '🐱 다람쥐 샐리 승리! 🎉';
        showVictoryVideo('sally');
    }

    modal.classList.add('show');
}

// 게임 재시작
function restartGame() {
    currentPlayer = 1;
    positions = { 1: 1, 2: 1 };
    isRolling = false;
    canRollAgain = false;

    document.getElementById('victoryModal').classList.remove('show');
    document.getElementById('dice').querySelector('.dice-face').textContent = '?';
    showMessage('');

    updatePlayerPieces();
    updateTurnInfo();

    document.getElementById('rollBtn').disabled = false;
}

// 유틸리티 함수
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    updateTurnInfo();
});
