// Game state
let currentPlayer = 'celeste'; // 'celeste' or 'sally'
let selectedNumbers = new Set();
let celesteBoard = [];
let sallyBoard = [];
let celesteBingos = 0;
let sallyBingos = 0;

// Initialize the game
function initGame() {
    // Generate random boards for both players
    celesteBoard = generateRandomBoard();
    sallyBoard = generateRandomBoard();

    // Render boards
    renderBoard('celeste-board', celesteBoard);
    renderBoard('sally-board', sallyBoard);

    // Create number selector
    createNumberSelector();

    updateTurnIndicator();
}

// Generate a random 5x5 board with numbers 1-25
function generateRandomBoard() {
    const numbers = Array.from({length: 25}, (_, i) => i + 1);

    // Shuffle using Fisher-Yates algorithm
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Convert to 5x5 grid
    const board = [];
    for (let i = 0; i < 5; i++) {
        board.push(numbers.slice(i * 5, (i + 1) * 5));
    }

    return board;
}

// Render a bingo board
function renderBoard(boardId, board) {
    const boardElement = document.getElementById(boardId);
    boardElement.innerHTML = '';

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = board[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.number = board[row][col];
            boardElement.appendChild(cell);
        }
    }
}

// Create number selector (1-25 buttons)
function createNumberSelector() {
    const grid = document.getElementById('number-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= 25; i++) {
        const button = document.createElement('button');
        button.className = 'number-button';
        button.textContent = i;
        button.dataset.number = i;
        button.addEventListener('click', () => selectNumber(i));
        grid.appendChild(button);
    }
}

// Handle number selection
function selectNumber(number) {
    if (selectedNumbers.has(number)) {
        return;
    }

    selectedNumbers.add(number);

    // Mark the number on both boards
    markNumberOnBoard('celeste-board', celesteBoard, number);
    markNumberOnBoard('sally-board', sallyBoard, number);

    // Disable the button
    const buttons = document.querySelectorAll('.number-button');
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.number) === number) {
            btn.disabled = true;
        }
    });

    // Check for bingos
    const celesteNewBingos = countBingos('celeste-board', celesteBoard);
    const sallyNewBingos = countBingos('sally-board', sallyBoard);

    // Show "빙고!" animation if new bingo achieved
    if (celesteNewBingos > celesteBingos) {
        showBingoAnimation();
        celesteBingos = celesteNewBingos;
        document.getElementById('celeste-bingo').textContent = celesteBingos;
    }

    if (sallyNewBingos > sallyBingos) {
        showBingoAnimation();
        sallyBingos = sallyNewBingos;
        document.getElementById('sally-bingo').textContent = sallyBingos;
    }

    // Check for winner (first to 3 bingos)
    if (celesteBingos >= 3) {
        endGame('celeste');
        return;
    }
    if (sallyBingos >= 3) {
        endGame('sally');
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === 'celeste' ? 'sally' : 'celeste';
    updateTurnIndicator();
}

// Mark a number on a board
function markNumberOnBoard(boardId, board, number) {
    const boardElement = document.getElementById(boardId);
    const cells = boardElement.querySelectorAll('.bingo-cell');

    cells.forEach(cell => {
        if (parseInt(cell.dataset.number) === number) {
            cell.classList.add('selected');
        }
    });
}

// Count bingos and highlight lines
function countBingos(boardId, board) {
    const boardElement = document.getElementById(boardId);
    const cells = boardElement.querySelectorAll('.bingo-cell');

    // Remove previous bingo-line highlighting
    cells.forEach(cell => cell.classList.remove('bingo-line'));

    let bingoCount = 0;
    const bingoLines = [];

    // Check rows
    for (let row = 0; row < 5; row++) {
        if (isLineBingo(board, row, 0, 0, 1)) {
            bingoCount++;
            bingoLines.push({type: 'row', index: row});
        }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
        if (isLineBingo(board, 0, col, 1, 0)) {
            bingoCount++;
            bingoLines.push({type: 'col', index: col});
        }
    }

    // Check diagonal (top-left to bottom-right)
    if (isLineBingo(board, 0, 0, 1, 1)) {
        bingoCount++;
        bingoLines.push({type: 'diag1'});
    }

    // Check diagonal (top-right to bottom-left)
    if (isLineBingo(board, 0, 4, 1, -1)) {
        bingoCount++;
        bingoLines.push({type: 'diag2'});
    }

    // Highlight bingo lines
    highlightBingoLines(boardId, bingoLines);

    return bingoCount;
}

// Check if a line is a bingo
function isLineBingo(board, startRow, startCol, rowDelta, colDelta) {
    for (let i = 0; i < 5; i++) {
        const row = startRow + i * rowDelta;
        const col = startCol + i * colDelta;
        const number = board[row][col];

        if (!selectedNumbers.has(number)) {
            return false;
        }
    }
    return true;
}

// Highlight bingo lines
function highlightBingoLines(boardId, lines) {
    const boardElement = document.getElementById(boardId);
    const cells = boardElement.querySelectorAll('.bingo-cell');

    lines.forEach(line => {
        if (line.type === 'row') {
            for (let col = 0; col < 5; col++) {
                const index = line.index * 5 + col;
                cells[index].classList.add('bingo-line');
            }
        } else if (line.type === 'col') {
            for (let row = 0; row < 5; row++) {
                const index = row * 5 + line.index;
                cells[index].classList.add('bingo-line');
            }
        } else if (line.type === 'diag1') {
            for (let i = 0; i < 5; i++) {
                const index = i * 5 + i;
                cells[index].classList.add('bingo-line');
            }
        } else if (line.type === 'diag2') {
            for (let i = 0; i < 5; i++) {
                const index = i * 5 + (4 - i);
                cells[index].classList.add('bingo-line');
            }
        }
    });
}

// Show "빙고!" animation
function showBingoAnimation() {
    const animation = document.createElement('div');
    animation.className = 'bingo-animation';
    animation.textContent = '빙고!';
    document.body.appendChild(animation);

    setTimeout(() => {
        document.body.removeChild(animation);
    }, 1000);
}

// Update turn indicator
function updateTurnIndicator() {
    const indicator = document.getElementById('current-turn');
    indicator.textContent = currentPlayer === 'celeste' ? '부엉이의 차례' : '샐리의 차례';
}

// End game and show winner
function endGame(winner) {
    const modal = document.getElementById('victory-modal');
    const winnerText = document.getElementById('winner-text');
    const winnerMessage = document.getElementById('winner-message');

    if (winner === 'celeste') {
        winnerText.textContent = '🎉 부엉이 승리! 🎉';
        winnerMessage.textContent = '부엉이가 먼저 3줄 빙고를 완성했습니다!';
    } else {
        winnerText.textContent = '🎉 샐리 승리! 🎉';
        winnerMessage.textContent = '샐리가 먼저 3줄 빙고를 완성했습니다!';
    }

    modal.style.display = 'flex';

    // Show victory video
    if (typeof showVictoryVideo === 'function') {
        showVictoryVideo(winner);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
