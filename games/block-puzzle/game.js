// Constants
const CELESTE = 1;
const SALLY = 2;
const GRID_SIZE = 8;

// Tetromino shapes
const TETROMINOES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    L: [[1, 0], [1, 0], [1, 1]],
    J: [[0, 1], [0, 1], [1, 1]]
};

const PIECE_NAMES = Object.keys(TETROMINOES);

// Game state
let board = [];
let currentPlayer = CELESTE;
let currentPiece = null;
let currentPieceType = '';
let scores = { [CELESTE]: 0, [SALLY]: 0 };
let consecutivePasses = 0;
let hoverPosition = null;

// Sound effects
const sounds = {
    place: () => playSound(800, 0.1, 'square'),
    clear: () => playSound(1200, 0.2, 'sine'),
    pass: () => playSound(400, 0.1, 'sawtooth'),
    rotate: () => playSound(600, 0.05, 'triangle'),
    win: () => {
        playSound(523, 0.1, 'sine');
        setTimeout(() => playSound(659, 0.1, 'sine'), 100);
        setTimeout(() => playSound(784, 0.2, 'sine'), 200);
    }
};

function playSound(freq, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Initialize game
function initGame() {
    board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    currentPlayer = CELESTE;
    scores = { [CELESTE]: 0, [SALLY]: 0 };
    consecutivePasses = 0;
    generatePiece();
    renderBoard();
    renderPreview();
    updateUI();
}

// Generate random piece
function generatePiece() {
    const randomIndex = Math.floor(Math.random() * PIECE_NAMES.length);
    currentPieceType = PIECE_NAMES[randomIndex];
    currentPiece = TETROMINOES[currentPieceType].map(row => [...row]);
}

// Rotate piece 90 degrees clockwise
function rotatePiece() {
    if (!currentPiece) return;

    sounds.rotate();
    const rows = currentPiece.length;
    const cols = currentPiece[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = currentPiece[r][c];
        }
    }

    currentPiece = rotated;
    renderPreview();
    if (hoverPosition) {
        renderBoard();
    }
}

// Check if piece can be placed at position
function canPlace(piece, startRow, startCol) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] === 1) {
                const boardRow = startRow + r;
                const boardCol = startCol + c;

                if (boardRow < 0 || boardRow >= GRID_SIZE ||
                    boardCol < 0 || boardCol >= GRID_SIZE) {
                    return false;
                }

                if (board[boardRow][boardCol] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place piece on board
function placePiece(piece, startRow, startCol) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] === 1) {
                board[startRow + r][startCol + c] = currentPlayer;
            }
        }
    }
}

// Check and clear complete lines
function checkAndClearLines() {
    let linesCleared = 0;
    const cellsToClear = new Set();

    // Check rows
    for (let r = 0; r < GRID_SIZE; r++) {
        if (board[r].every(cell => cell !== 0)) {
            linesCleared++;
            for (let c = 0; c < GRID_SIZE; c++) {
                cellsToClear.add(`${r},${c}`);
            }
        }
    }

    // Check columns
    for (let c = 0; c < GRID_SIZE; c++) {
        let columnFull = true;
        for (let r = 0; r < GRID_SIZE; r++) {
            if (board[r][c] === 0) {
                columnFull = false;
                break;
            }
        }
        if (columnFull) {
            linesCleared++;
            for (let r = 0; r < GRID_SIZE; r++) {
                cellsToClear.add(`${r},${c}`);
            }
        }
    }

    if (linesCleared > 0) {
        // Animate clearing
        const cells = Array.from(cellsToClear).map(pos => {
            const [r, c] = pos.split(',').map(Number);
            return document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        });

        cells.forEach(cell => cell?.classList.add('clearing'));

        setTimeout(() => {
            cellsToClear.forEach(pos => {
                const [r, c] = pos.split(',').map(Number);
                board[r][c] = 0;
            });

            const points = linesCleared * 10;
            scores[currentPlayer] += points;
            sounds.clear();
            renderBoard();
            updateUI();
            updateMessage(`${linesCleared}줄 클리어! +${points}점!`);
        }, 500);
    }

    return linesCleared;
}

// Check if any valid placement exists for current piece
function hasValidPlacement() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (canPlace(currentPiece, r, c)) {
                return true;
            }
        }
    }
    return false;
}

// Handle cell click
function handleCellClick(row, col) {
    if (!currentPiece) return;

    if (canPlace(currentPiece, row, col)) {
        placePiece(currentPiece, row, col);
        sounds.place();
        consecutivePasses = 0;

        setTimeout(() => {
            const linesCleared = checkAndClearLines();

            setTimeout(() => {
                switchPlayer();
            }, linesCleared > 0 ? 600 : 100);
        }, 100);
    }
}

// Handle cell hover
function handleCellHover(row, col) {
    hoverPosition = { row, col };
    renderBoard();
}

// Clear hover
function clearHover() {
    hoverPosition = null;
    renderBoard();
}

// Pass turn
function passTurn() {
    if (!currentPiece) return;

    sounds.pass();
    scores[currentPlayer] = Math.max(0, scores[currentPlayer] - 5);
    consecutivePasses++;

    updateMessage(`패스! -5점`);

    setTimeout(() => {
        if (consecutivePasses >= 2) {
            endGame();
        } else {
            switchPlayer();
        }
    }, 1000);
}

// Switch to next player
function switchPlayer() {
    currentPlayer = currentPlayer === CELESTE ? SALLY : CELESTE;
    generatePiece();
    renderBoard();
    renderPreview();
    updateUI();

    // Check if new player can place piece
    if (!hasValidPlacement()) {
        updateMessage(`${currentPlayer === CELESTE ? '부엉이' : '샐리'} - 놓을 곳이 없어요! 패스하세요.`);
    }
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            const cellValue = board[r][c];
            if (cellValue === CELESTE) {
                cell.classList.add('celeste');
            } else if (cellValue === SALLY) {
                cell.classList.add('sally');
            }

            // Show ghost preview on hover
            if (hoverPosition && currentPiece) {
                const { row, col } = hoverPosition;
                const pieceR = r - row;
                const pieceC = c - col;

                if (pieceR >= 0 && pieceR < currentPiece.length &&
                    pieceC >= 0 && pieceC < currentPiece[0].length &&
                    currentPiece[pieceR][pieceC] === 1 &&
                    cellValue === 0) {

                    if (canPlace(currentPiece, row, col)) {
                        cell.classList.add(currentPlayer === CELESTE ? 'ghost-celeste' : 'ghost-sally');
                    } else {
                        cell.classList.add('ghost-invalid');
                    }
                }
            }

            cell.addEventListener('click', () => handleCellClick(r, c));
            cell.addEventListener('mouseenter', () => handleCellHover(r, c));
            cell.addEventListener('mouseleave', clearHover);

            boardEl.appendChild(cell);
        }
    }
}

// Render piece preview
function renderPreview() {
    const previewEl = document.getElementById('preview');
    if (!currentPiece) {
        previewEl.innerHTML = '';
        return;
    }

    const rows = currentPiece.length;
    const cols = currentPiece[0].length;

    previewEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    previewEl.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    previewEl.innerHTML = '';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';

            if (currentPiece[r][c] === 1) {
                cell.classList.add('filled');
                cell.classList.add(currentPlayer === CELESTE ? 'celeste' : 'sally');
            }

            previewEl.appendChild(cell);
        }
    }
}

// Update UI
function updateUI() {
    document.getElementById('celesteScore').textContent = `${scores[CELESTE]}점`;
    document.getElementById('sallyScore').textContent = `${scores[SALLY]}점`;

    const celesteCard = document.getElementById('celesteCard');
    const sallyCard = document.getElementById('sallyCard');

    celesteCard.classList.toggle('active', currentPlayer === CELESTE);
    sallyCard.classList.toggle('active', currentPlayer === SALLY);

    updateMessage(`${currentPlayer === CELESTE ? '부엉이' : '샐리'} 차례!`);
}

// Update message
function updateMessage(msg) {
    document.getElementById('message').textContent = msg;
}

// End game
function endGame() {
    const celesteScore = scores[CELESTE];
    const sallyScore = scores[SALLY];

    let winner;
    let winnerText;

    if (celesteScore > sallyScore) {
        winner = '부엉이';
        winnerText = '🦉 부엉이 승리! 🦉';
    } else if (sallyScore > celesteScore) {
        winner = '샐리';
        winnerText = '🐿️ 샐리 승리! 🐿️';
    } else {
        winnerText = '🤝 무승부! 🤝';
    }

    document.getElementById('winnerText').textContent = winnerText;
    document.getElementById('finalScores').innerHTML = `
        부엉이: ${celesteScore}점<br>
        샐리: ${sallyScore}점
    `;

    document.getElementById('gameOverModal').classList.add('show');

    sounds.win();
    createConfetti();

    if (typeof showVictoryVideo === 'function') {
        showVictoryVideo();
    }
}

// Close modal
function closeModal() {
    document.getElementById('gameOverModal').classList.remove('show');
}

// Create confetti
function createConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#9d4edd'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `fall ${2 + Math.random() * 2}s linear`;

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// Add fall animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
window.addEventListener('load', initGame);
