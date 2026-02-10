// Constants
const CELESTE = 1;
const SALLY = 2;
const BOARD_SIZE = 6;

// Game state
let board = [];
let currentPlayer = CELESTE;
let isGameOver = false;

// Pipe templates (connections: [top, right, bottom, left])
const PIPE_TYPES = [
    // Straight pipes
    [true, false, true, false],   // vertical
    [false, true, false, true],   // horizontal
    // Corner pipes
    [true, true, false, false],   // top-right
    [false, true, true, false],   // right-bottom
    [false, false, true, true],   // bottom-left
    [true, false, false, true],   // left-top
    // T-junction pipes
    [true, true, true, false],    // T facing left
    [false, true, true, true],    // T facing top
    [true, false, true, true],    // T facing right
    [true, true, false, true],    // T facing bottom
    // Cross pipe
    [true, true, true, true]      // all directions
];

// Initialize game
function initGame() {
    board = generateBoard();
    currentPlayer = CELESTE;
    isGameOver = false;
    renderBoard();
    updateUI();
    updateMessage('부엉이가 먼저 시작합니다! 🦉');
}

// Generate random board
function generateBoard() {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const randomPipe = PIPE_TYPES[Math.floor(Math.random() * PIPE_TYPES.length)];
            newBoard[row][col] = {
                connections: [...randomPipe],
                rotation: 0
            };
        }
    }
    return newBoard;
}

// Render the board
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'pipe-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.onclick = () => handleCellClick(row, col);

            // Add rotation animation
            cell.style.transform = `rotate(${board[row][col].rotation}deg)`;

            // Add pipe segments based on connections
            const connections = board[row][col].connections;
            if (connections[0]) { // top
                const segment = document.createElement('span');
                segment.className = 'pipe-segment pipe-segment-top';
                cell.appendChild(segment);
            }
            if (connections[1]) { // right
                const segment = document.createElement('span');
                segment.className = 'pipe-segment pipe-segment-right';
                cell.appendChild(segment);
            }
            if (connections[2]) { // bottom
                const segment = document.createElement('span');
                segment.className = 'pipe-segment pipe-segment-bottom';
                cell.appendChild(segment);
            }
            if (connections[3]) { // left
                const segment = document.createElement('span');
                segment.className = 'pipe-segment pipe-segment-left';
                cell.appendChild(segment);
            }

            boardElement.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(row, col) {
    if (isGameOver) return;

    playRotateSound();

    // Rotate pipe 90 degrees clockwise
    board[row][col].rotation = (board[row][col].rotation + 90) % 360;
    board[row][col].connections = rotatePipeConnections(board[row][col].connections);

    renderBoard();

    // Check if current player won
    if (checkWin(currentPlayer)) {
        endGame(currentPlayer);
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === CELESTE ? SALLY : CELESTE;
    updateUI();
}

// Rotate pipe connections 90 degrees clockwise
function rotatePipeConnections(connections) {
    // [top, right, bottom, left] -> [left, top, right, bottom]
    return [connections[3], connections[0], connections[1], connections[2]];
}

// Check if player has won
function checkWin(player) {
    if (player === CELESTE) {
        // Check path from (2, 0) to (2, 5)
        return hasPath(2, 0, 2, 5, 1); // direction 1 = right
    } else {
        // Check path from (0, 2) to (5, 2)
        return hasPath(0, 2, 5, 2, 2); // direction 2 = bottom
    }
}

// BFS to check if path exists
function hasPath(startRow, startCol, endRow, endCol, startDir) {
    const queue = [[startRow, startCol]];
    const visited = new Set();
    visited.add(`${startRow},${startCol}`);

    // Direction mappings: 0=top, 1=right, 2=bottom, 3=left
    const dirOffsets = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // Check if reached destination
        if (row === endRow && col === endCol) {
            highlightWinningPath(startRow, startCol, endRow, endCol);
            return true;
        }

        // Try all four directions
        for (let dir = 0; dir < 4; dir++) {
            // Current cell must have opening in this direction
            if (!board[row][col].connections[dir]) continue;

            const [dRow, dCol] = dirOffsets[dir];
            const newRow = row + dRow;
            const newCol = col + dCol;

            // Check bounds
            if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) continue;

            // Check if already visited
            const key = `${newRow},${newCol}`;
            if (visited.has(key)) continue;

            // Next cell must have opening back to current cell
            const oppositeDir = (dir + 2) % 4;
            if (!board[newRow][newCol].connections[oppositeDir]) continue;

            visited.add(key);
            queue.push([newRow, newCol]);
        }
    }

    return false;
}

// Highlight winning path
function highlightWinningPath(startRow, startCol, endRow, endCol) {
    const cells = document.querySelectorAll('.pipe-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Simple highlight - mark all cells in the winning row/column
        if (currentPlayer === CELESTE && row === 2) {
            cell.classList.add('winning-path', 'celeste-path');
        } else if (currentPlayer === SALLY && col === 2) {
            cell.classList.add('winning-path', 'sally-path');
        }
    });
}

// Update UI to show active player
function updateUI() {
    const player1Card = document.getElementById('player1Card');
    const player2Card = document.getElementById('player2Card');

    if (currentPlayer === CELESTE) {
        player1Card.classList.add('active');
        player2Card.classList.remove('active');
        updateMessage('부엉이 차례입니다! 파이프를 클릭하세요 🦉');
    } else {
        player1Card.classList.remove('active');
        player2Card.classList.add('active');
        updateMessage('샐리 차례입니다! 파이프를 클릭하세요 🐿️');
    }
}

// Update message area
function updateMessage(msg) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = msg;
    messageArea.style.animation = 'none';
    setTimeout(() => {
        messageArea.style.animation = 'fadeIn 0.5s ease-in-out';
    }, 10);
}

// End game
function endGame(winner) {
    isGameOver = true;
    playWinSound();

    const modal = document.getElementById('gameOverModal');
    const winnerAvatar = document.getElementById('winnerAvatar');
    const winnerText = document.getElementById('winnerText');
    const finalScore = document.getElementById('finalScore');

    if (winner === CELESTE) {
        winnerAvatar.src = '../../assets/celeste.png';
        winnerText.textContent = '🦉 부엉이 승리! 🦉';
        finalScore.textContent = '파이프를 성공적으로 연결했습니다!';
        updateMessage('🎉 부엉이가 승리했습니다! 🎉');
        showVictoryVideo('celeste');
    } else {
        winnerAvatar.src = '../../assets/sally.png';
        winnerText.textContent = '🐿️ 샐리 승리! 🐿️';
        finalScore.textContent = '파이프를 성공적으로 연결했습니다!';
        updateMessage('🎉 샐리가 승리했습니다! 🎉');
        showVictoryVideo('sally');
    }

    createConfetti();
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
    document.getElementById('confettiContainer').innerHTML = '';
}

// Create confetti effect
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = ['#7BC96F', '#FFD700', '#C94C4C', '#87CEEB'][Math.floor(Math.random() * 4)];
        container.appendChild(confetti);
    }
}

// Sound effects
function playRotateSound() {
    // Simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silent fail if audio not supported
    }
}

function playWinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Silent fail if audio not supported
    }
}

// Initialize game on load
window.addEventListener('DOMContentLoaded', initGame);
