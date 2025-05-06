class UltimateTicTacToe {
    constructor() {
        this.initGame();
        this.initEventListeners();
        this.startTimer();
    }

    initGame() {
        this.board = Array(9).fill().map(() => Array(9).fill(''));
        this.bigBoard = Array(9).fill('');
        this.currentPlayer = 'X';
        this.activeBoard = -1;
        this.gameOver = false;
        this.moveStartTime = Date.now();
        this.playerTimes = {
            X: 0,
            O: 0
        };

        this.initializeBoard();
        this.updateStatus();
        this.updateActiveCells();
        this.hideVictoryScreen();
        this.resetTimer();
    }

    initEventListeners() {
        document.getElementById('restart').addEventListener('click', () => this.restart());

        const helpButton = document.getElementById('help-button');
        const rulesModal = document.getElementById('rules-modal');
        const closeButton = rulesModal.querySelector('.close-button');

        helpButton.addEventListener('click', () => {
            rulesModal.classList.add('active');
        });

        closeButton.addEventListener('click', () => {
            rulesModal.classList.remove('active');
        });

        rulesModal.addEventListener('click', (e) => {
            if (e.target === rulesModal) {
                rulesModal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && rulesModal.classList.contains('active')) {
                rulesModal.classList.remove('active');
            }
        });
    }

    initializeBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const bigCell = document.createElement('div');
            bigCell.className = 'big-cell';
            bigCell.dataset.index = i;

            for (let j = 0; j < 9; j++) {
                const smallCell = document.createElement('button');
                smallCell.className = 'small-cell';
                smallCell.dataset.bigIndex = i;
                smallCell.dataset.smallIndex = j;
                smallCell.addEventListener('click', () => this.makeMove(i, j));
                bigCell.appendChild(smallCell);
            }

            boardElement.appendChild(bigCell);
        }
    }

    restart() {
        clearInterval(this.timerInterval);
        this.initGame();
        this.startTimer();
    }

    showVictoryScreen(winner) {
        const victoryScreen = document.getElementById('victory-screen');
        const victoryText = victoryScreen.querySelector('.victory-text');
        victoryText.textContent = `Игрок ${winner} победил!`;
        
        const confetti = victoryScreen.querySelector('.confetti');
        confetti.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.backgroundColor = this.getRandomColor();
            piece.style.animationDelay = `${Math.random() * 2}s`;
            confetti.appendChild(piece);
        }

        victoryScreen.classList.add('active');
    }

    hideVictoryScreen() {
        const victoryScreen = document.getElementById('victory-screen');
        victoryScreen.classList.remove('active');
    }

    getRandomColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    startTimer() {
        this.moveStartTime = Date.now();
        this.timerInterval = setInterval(() => {
            if (!this.gameOver) {
                const currentMoveTime = Math.floor((Date.now() - this.moveStartTime) / 1000);
                document.getElementById('current-timer').textContent = `Время хода: ${currentMoveTime}с`;
                
                // Обновляем общее время текущего игрока
                const totalTime = this.playerTimes[this.currentPlayer] + currentMoveTime;
                document.getElementById(`${this.currentPlayer.toLowerCase()}-timer`).textContent = `${totalTime}с`;
                
                // Подсвечиваем активный таймер
                document.querySelectorAll('.timer-block').forEach(block => {
                    block.classList.remove('active');
                });
                const activeBlock = document.querySelector(`.timer-block:nth-child(${this.currentPlayer === 'X' ? 1 : 2})`);
                if (activeBlock) activeBlock.classList.add('active');
            }
        }, 1000);
    }

    resetTimer() {
        if (this.moveStartTime) {
            const moveTime = Math.floor((Date.now() - this.moveStartTime) / 1000);
            this.playerTimes[this.currentPlayer] += moveTime;
        }
        this.moveStartTime = Date.now();
        document.getElementById('current-timer').textContent = 'Время хода: 0с';
        
        // Обновляем отображение общего времени для обоих игроков
        document.getElementById('x-timer').textContent = `${this.playerTimes.X}с`;
        document.getElementById('o-timer').textContent = `${this.playerTimes.O}с`;
        
        // Подсвечиваем активный таймер
        document.querySelectorAll('.timer-block').forEach(block => {
            block.classList.remove('active');
        });
        const activeBlock = document.querySelector(`.timer-block:nth-child(${this.currentPlayer === 'X' ? 1 : 2})`);
        if (activeBlock) activeBlock.classList.add('active');
    }

    makeMove(bigIndex, smallIndex) {
        if (this.gameOver) return;
        if (this.activeBoard !== -1 && this.activeBoard !== bigIndex) return;
        if (this.board[bigIndex][smallIndex] !== '') return;
        if (this.bigBoard[bigIndex] !== '') return;

        const moveTime = Math.floor((Date.now() - this.moveStartTime) / 1000);
        this.playerTimes[this.currentPlayer] += moveTime;

        this.board[bigIndex][smallIndex] = this.currentPlayer;
        const smallCell = document.querySelector(`[data-big-index="${bigIndex}"][data-small-index="${smallIndex}"]`);
        smallCell.classList.add(this.currentPlayer.toLowerCase());
        smallCell.setAttribute('data-symbol', this.currentPlayer);
        smallCell.disabled = true;

        if (this.checkWin(this.board[bigIndex])) {
            this.bigBoard[bigIndex] = this.currentPlayer;
            const bigCell = document.querySelector(`[data-index="${bigIndex}"]`);
            bigCell.classList.add('completed', this.currentPlayer.toLowerCase());
            this.disableAllCellsInBoard(bigIndex);
        } else if (this.isBoardFull(this.board[bigIndex])) {
            this.bigBoard[bigIndex] = 'T';
            this.disableAllCellsInBoard(bigIndex);
        }

        if (this.checkWin(this.bigBoard)) {
            this.gameOver = true;
            this.showVictoryScreen(this.currentPlayer);
            return;
        } else if (this.isBoardFull(this.bigBoard)) {
            this.gameOver = true;
            document.getElementById('status').textContent = 'Ничья!';
            return;
        }

        this.activeBoard = this.bigBoard[smallIndex] === '' ? smallIndex : -1;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        this.updateStatus();
        this.updateActiveCells();
        this.resetTimer();
    }

    checkWin(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return board[a] && board[a] !== 'T' && board[a] === board[b] && board[a] === board[c];
        });
    }

    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    disableAllCellsInBoard(bigIndex) {
        const cells = document.querySelectorAll(`[data-big-index="${bigIndex}"]`);
        cells.forEach(cell => cell.disabled = true);
    }

    updateActiveCells() {
        const bigCells = document.querySelectorAll('.big-cell');
        bigCells.forEach(cell => {
            cell.classList.remove('active');
            const index = parseInt(cell.dataset.index);
            
            if ((this.activeBoard === -1 || this.activeBoard === index) && this.bigBoard[index] === '') {
                cell.classList.add('active');
                const smallCells = cell.querySelectorAll('.small-cell');
                smallCells.forEach(smallCell => {
                    if (!smallCell.classList.contains('x') && !smallCell.classList.contains('o')) {
                        smallCell.disabled = false;
                    }
                });
            } else {
                const smallCells = cell.querySelectorAll('.small-cell');
                smallCells.forEach(smallCell => smallCell.disabled = true);
            }
        });
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        if (!this.gameOver) {
            let status = `Ход игрока: ${this.currentPlayer}`;
            if (this.activeBoard !== -1) {
                status += ` (ходите в поле ${this.activeBoard + 1})`;
            }
            statusElement.textContent = status;
        }
    }
}

// Запускаем игру
window.addEventListener('DOMContentLoaded', () => {
    window.game = new UltimateTicTacToe();
}); 