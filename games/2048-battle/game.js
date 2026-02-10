// Player constants
const CELESTE = 1;
const SALLY = 2;

// Game state
let currentPlayer = CELESTE;
let board1 = [];
let board2 = [];
let score1 = 0;
let score2 = 0;
let maxTile1 = 2;
let maxTile2 = 2;
let gameOver = false;

// Initialize game
function initGame() {
    currentPlayer = CELESTE;
    board1 = createEmptyBoard();
    board2 = createEmptyBoard();
    score1 = 0;
    score2 = 0;
    maxTile1 = 2;
    maxTile2 = 2;
    gameOver = false;

    // Add initial tiles for both players
    addRandomTile(board1);
    addRandomTile(board1);
    addRandomTile(board2);
    addRandomTile(board2);

    renderBoards();
    updateUI();
    updateMessage('부엉이의 차례입니다!');

    document.getElementById('gameOverModal').style.display = 'none';
}

function createEmptyBoard() {
    return Array(4).fill(null).map(() => Array(4).fill(0));
}

function addRandomTile(board) {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) {
                emptyCells.push({r, c});
            }
        }
    }

    if (emptyCells.length > 0) {
        const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoards() {
    renderBoard(board1, 'board1');
    renderBoard(board2, 'board2');
}

function renderBoard(board, elementId) {
    const boardElement = document.getElementById(elementId);
    boardElement.innerHTML = '';

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            const value = board[r][c];

            if (value > 0) {
                tile.classList.add(`tile-${value}`);
                tile.textContent = value;

                if (value >= 2048) {
                    tile.classList.add('tile-super');
                }
            } else {
                tile.classList.add('tile-empty');
            }

            boardElement.appendChild(tile);
        }
    }
}

function updateUI() {
    // Update scores
    document.getElementById('score1').textContent = score1;
    document.getElementById('score2').textContent = score2;
    document.getElementById('maxTile1').textContent = maxTile1;
    document.getElementById('maxTile2').textContent = maxTile2;

    // Update active player indicator
    const section1 = document.getElementById('player1Section');
    const section2 = document.getElementById('player2Section');

    if (currentPlayer === CELESTE) {
        section1.classList.add('active');
        section2.classList.remove('active');
    } else {
        section1.classList.remove('active');
        section2.classList.add('active');
    }
}

function updateMessage(msg) {
    document.getElementById('messageArea').textContent = msg;
}

// Movement logic
function handleMove(direction) {
    if (gameOver) return;

    const currentBoard = currentPlayer === CELESTE ? board1 : board2;
    const boardCopy = JSON.parse(JSON.stringify(currentBoard));

    let moved = false;
    let mergeScore = 0;

    if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
            const result = slideAndMergeRow(currentBoard[r]);
            currentBoard[r] = result.row;
            moved = moved || result.moved;
            mergeScore += result.score;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
            const result = slideAndMergeRow(currentBoard[r].reverse());
            currentBoard[r] = result.row.reverse();
            moved = moved || result.moved;
            mergeScore += result.score;
        }
    } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
            const column = [currentBoard[0][c], currentBoard[1][c], currentBoard[2][c], currentBoard[3][c]];
            const result = slideAndMergeRow(column);
            for (let r = 0; r < 4; r++) {
                currentBoard[r][c] = result.row[r];
            }
            moved = moved || result.moved;
            mergeScore += result.score;
        }
    } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
            const column = [currentBoard[3][c], currentBoard[2][c], currentBoard[1][c], currentBoard[0][c]];
            const result = slideAndMergeRow(column);
            for (let r = 0; r < 4; r++) {
                currentBoard[3-r][c] = result.row[r];
            }
            moved = moved || result.moved;
            mergeScore += result.score;
        }
    }

    if (moved) {
        playMoveSound();

        if (mergeScore > 0) {
            playMergeSound();
            if (currentPlayer === CELESTE) {
                score1 += mergeScore;
            } else {
                score2 += mergeScore;
            }
        }

        // Update max tile
        updateMaxTile(currentBoard, currentPlayer);

        // Add new random tile
        addRandomTile(currentBoard);

        // Render and update
        renderBoards();
        updateUI();

        // Check if current player can still move
        if (!canMove(currentBoard)) {
            const playerName = currentPlayer === CELESTE ? '부엉이' : '샐리';
            updateMessage(`${playerName}는 더 이상 움직일 수 없습니다!`);

            // Check if other player can move
            const otherBoard = currentPlayer === CELESTE ? board2 : board1;
            if (!canMove(otherBoard)) {
                // Both players stuck - game over
                setTimeout(endGame, 1000);
                return;
            }
        }

        // Switch turn
        currentPlayer = currentPlayer === CELESTE ? SALLY : CELESTE;
        const nextPlayer = currentPlayer === CELESTE ? '부엉이' : '샐리';
        updateMessage(`${nextPlayer}의 차례입니다!`);
        updateUI();
    }
}

function slideAndMergeRow(row) {
    let newRow = row.filter(val => val !== 0);
    let moved = false;
    let score = 0;

    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow.splice(i + 1, 1);
            moved = true;
        }
    }

    while (newRow.length < 4) {
        newRow.push(0);
    }

    if (JSON.stringify(newRow) !== JSON.stringify(row)) {
        moved = true;
    }

    return {row: newRow, moved, score};
}

function updateMaxTile(board, player) {
    let max = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] > max) {
                max = board[r][c];
            }
        }
    }

    if (player === CELESTE) {
        maxTile1 = max;
    } else {
        maxTile2 = max;
    }
}

function canMove(board) {
    // Check for empty cells
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return true;
        }
    }

    // Check for possible merges
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const current = board[r][c];
            // Check right
            if (c < 3 && board[r][c + 1] === current) return true;
            // Check down
            if (r < 3 && board[r + 1][c] === current) return true;
        }
    }

    return false;
}

function endGame() {
    gameOver = true;
    playWinSound();

    const modal = document.getElementById('gameOverModal');
    const winnerText = document.getElementById('winnerText');
    const finalScores = document.getElementById('finalScores');
    const winnerAvatar = document.getElementById('winnerAvatar');

    let winner;
    if (maxTile1 > maxTile2) {
        winner = 'celeste';
        winnerText.innerHTML = '<h3>🎊 부엉이 승리! 🎊</h3>';
        winnerAvatar.src = '../../assets/celeste.png';
    } else if (maxTile2 > maxTile1) {
        winner = 'sally';
        winnerText.innerHTML = '<h3>🎊 샐리 승리! 🎊</h3>';
        winnerAvatar.src = '../../assets/sally.png';
    } else {
        // Same max tile - check total score
        if (score1 > score2) {
            winner = 'celeste';
            winnerText.innerHTML = '<h3>🎊 부엉이 승리! 🎊</h3>';
            winnerAvatar.src = '../../assets/celeste.png';
        } else if (score2 > score1) {
            winner = 'sally';
            winnerText.innerHTML = '<h3>🎊 샐리 승리! 🎊</h3>';
            winnerAvatar.src = '../../assets/sally.png';
        } else {
            winner = 'celeste'; // Default to celeste in case of tie
            winnerText.innerHTML = '<h3>🎊 무승부! 🎊</h3>';
            winnerAvatar.src = '../../assets/celeste.png';
        }
    }

    finalScores.innerHTML = `
        <p><strong>부엉이:</strong> 최고 ${maxTile1} | 점수 ${score1}</p>
        <p><strong>샐리:</strong> 최고 ${maxTile2} | 점수 ${score2}</p>
    `;

    modal.style.display = 'flex';
    createConfetti();

    showVictoryVideo(winner);
}

function closeModal() {
    document.getElementById('gameOverModal').style.display = 'none';
}

function createConfetti() {
    const modal = document.querySelector('.modal-content');
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf'][Math.floor(Math.random() * 4)];
        modal.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// Sound functions using Web Audio API
function playMoveSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch(e) {
        // Audio not supported
    }
}

function playMergeSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch(e) {
        // Audio not supported
    }
}

function playWinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
        // Audio not supported
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMove('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMove('down');
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMove('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMove('right');
    }
});

// Initialize game on load
initGame();
