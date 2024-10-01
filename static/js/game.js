document.addEventListener('DOMContentLoaded', () => {
    let currentRow = 0;
    let currentTile = 0;
    let isGameOver = false;
    let timerInterval;
    let score = 0;
    let secret_word;
    let totalTime = 5 * 60; // 5 minutes in seconds

    const gameBoard = document.getElementById('game-board');
    const keyboard = document.getElementById('keyboard');
    const messageArea = document.getElementById('message-area');
    const newGameBtn = document.getElementById('new-game-btn');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');

    function startCountdown() {
        timerInterval = setInterval(() => {
            let minutes = Math.floor(totalTime / 60);
            let seconds = totalTime % 60;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            timerDisplay.textContent = `${minutes}:${seconds}`;

            if (totalTime <= 0) {
                clearInterval(timerInterval);
                isGameOver = true;
                endGame("Time's up! The word was " + secret_word, false);
            }

            totalTime--;
        }, 1000);
    }

    function endGame(message, won = false) {
        isGameOver = true;
        showMessage(message, won ? 'success' : 'error');
        clearInterval(timerInterval);
    
        let gameResult = {
            result: won ? 'win' : 'loss',
            time: 5 * 60 - totalTime,
            guesses: currentRow != 0 ? currentRow + 1 : 0,
            score: score,
            date: new Date().toISOString(),
            correctWord: secret_word
        };
    
        storeGameResult(gameResult);
    }

    function storeGameResult(gameResult) {
        let gameHistory = JSON.parse(getCookie('gameHistory') || '[]');
        gameHistory.push(gameResult);

        document.cookie = `gameHistory=${JSON.stringify(gameHistory)}; path=/; max-age=31536000`;
    }

    function displayStats() {
        document.getElementById('stats-container').scrollTop = 0;

        let gameHistory = JSON.parse(getCookie('gameHistory') || '[]');

        gameHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        let winCount = 0, lossCount = 0, totalScore = 0, totalTime = 0, totalGuesses = 0;
        let bestGame = null, worstGame = null;

        gameHistory.forEach(game => {
            if (game.result === 'win') {
                winCount++;
                totalGuesses += game.guesses;
            } else {
                lossCount++;
            }
            totalScore += game.score;
            totalTime += game.time;

            if (!bestGame || game.score > bestGame.score || (game.score === bestGame.score && game.time < bestGame.time)) {
                bestGame = game;
            }
            if (!worstGame || game.score < worstGame.score || (game.score === worstGame.score && game.time > worstGame.time)) {
                worstGame = game;
            }
        });

        let tableHtml = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th>Time (s)</th>
                        <th>Guesses</th>
                        <th>Score</th>
                        <th>Correct Word</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        gameHistory.forEach(game => {
            let rowClass = '';
            if (game === bestGame) rowClass = 'best-game';
            else if (game === worstGame) rowClass = 'worst-game';

            tableHtml += `
                <tr class="${rowClass}">
                    <td>${game.result === 'win' ? 'Win' : 'Loss'}</td>
                    <td>${game.time}</td>
                    <td>${game.guesses}</td>
                    <td>${game.score}</td>
                    <td>${game.correctWord}</td>
                    <td>${new Date(game.date).toLocaleDateString()} ${new Date(game.date).toLocaleTimeString()}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        const totalGames = winCount + lossCount;
        const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
        const winLossRatio = totalGames > 0 ? (winCount / totalGames).toFixed(2) : 'N/A';
        const averageTime = totalGames > 0 ? Math.round(totalTime / totalGames) : 0;
        const averageGuesses = winCount > 0 ? (totalGuesses / winCount).toFixed(1) : 'N/A';

        const statsHtml = `
            <div class="stats-summary">
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">Total Games</span>
                        <span class="stat-value">${totalGames}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Wins</span>
                        <span class="stat-value">${winCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Losses</span>
                        <span class="stat-value">${lossCount}</span>
                    </div>
                </div>
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">Win Rate</span>
                        <span class="stat-value">${winLossRatio}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Score</span>
                        <span class="stat-value">${averageScore}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Time</span>
                        <span class="stat-value">${averageTime}s</span>
                    </div>
                </div>
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">Avg Guesses</span>
                        <span class="stat-value">${averageGuesses}</span>
                    </div>
                </div>
            </div>
            <h3>Game History</h3>
            <div class="stats-table-container">
                ${tableHtml}
            </div>
        `;

        document.getElementById('stats-container').innerHTML = statsHtml;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function handleKeyPress(key) {
        if (isGameOver) return;

        if (key === 'Enter') {
            const currentGuess = getCurrentGuess();
            if (currentGuess.length === 5) {
                submitGuess();
            } else {
                showMessage('Not enough letters', 'error');
            }
        } else if (key === 'Backspace') {
            if (currentTile > 0) {
                currentTile--;
                const tile = gameBoard.children[currentRow].children[currentTile];
                tile.textContent = '';
            }
        } else if (/^[A-Z]$/.test(key) && currentTile < 5) {
            const tile = gameBoard.children[currentRow].children[currentTile];
            tile.textContent = key;
            currentTile++;
        }
    }

    function getCurrentGuess() {
        return Array.from(gameBoard.children[currentRow].children)
            .map(tile => tile.textContent)
            .join('');
    }

    function submitGuess() {
        const guess = getCurrentGuess();

        fetch('/make_guess/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: `guess=${guess}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                if (data.error === 'No active game. Please start a new game.') {
                    initGame();
                } else {
                    showMessage(data.error, 'error');
                }
                return;
            }

            if (!data.valid_word) {
                showMessage('Not in word list', 'error');
                return;
            }
            else {
                showMessage('');
            }

            updateScore(data.score);
            updateRow(data.result);
            updateKeyboard(guess, data.result);

            if (data.game_over) {
                secret_word = data.secret_word;
                let message = data.secret_word === guess ? 
                    `Congratulations! You guessed the word!` : 
                    `Game over! The word was ${data.secret_word}`;
                
                if (data.win_bonus > 0) {
                    message += ` Win bonus: ${data.win_bonus} points!`;
                }
                if (data.time_bonus > 0) {
                    message += ` Time bonus: ${data.time_bonus} points!`;
                }
                
                endGame(message, data.secret_word === guess);
            } else {
                currentRow++;
                currentTile = 0;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        });
    }

    function updateScore(newScore) {
        score = newScore;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function updateRow(result) {
        const row = gameBoard.children[currentRow];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const tile = row.children[i];
                tile.classList.add('flip');
                setTimeout(() => {
                    tile.classList.add(result[i]);
                }, 250);
            }, i * 300);
        }
    }

    function updateKeyboard(guess, result) {
        for (let i = 0; i < 5; i++) {
            const key = keyboard.querySelector(`button[data-key="${guess[i]}"]`);
            if (key) {
                const newClass = result[i];
                if (newClass === 'correct' || (newClass === 'present' && !key.classList.contains('correct'))) {
                    key.className = `key ${newClass}`;
                } else if (newClass === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                    key.className = `key ${newClass}`;
                }
            }
        }
    }

    function showMessage(message, type = '') {
        messageArea.textContent = message;
        messageArea.className = type; // 'error', 'success', or '' for default
        messageArea.setAttribute('aria-label', message);
    }

    function initGame() {
        fetch('/new_game/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                secret_word = data.secret_word; // Store the secret word
                resetGame();
            } else {
                showMessage('Failed to start a new game. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error starting new game:', error);
            showMessage('An error occurred. Please try again.', 'error');
        });
    }

    function resetGame() {
        currentRow = 0;
        currentTile = 0;
        isGameOver = false;
        score = 0;
        totalTime = 5 * 60;
        showMessage('');
        timerDisplay.textContent = "5:00";
        scoreDisplay.textContent = "Score: 0";
        clearInterval(timerInterval);
        startCountdown();

        Array.from(gameBoard.children).forEach(row => {
            Array.from(row.children).forEach(tile => {
                tile.textContent = '';
                tile.className = 'letter-box';
            });
        });

        Array.from(keyboard.querySelectorAll('.key')).forEach(key => {
            key.className = 'key';
        });
    }

    function openStatsModal() {
        const modal = document.getElementById('stats-modal');
        const modalContent = modal.querySelector('.modal-content');
        const statsContainer = document.getElementById('stats-container');
        
        modal.style.display = 'block';
        
        // Reset scroll position
        statsContainer.scrollTop = 0;

        // Adjust modal for mobile
        if (window.innerWidth <= 600) {
            modalContent.style.height = '100%';
            modalContent.style.margin = '0';
            document.body.style.overflow = 'hidden'; // Prevent body scrolling
        } else {
            modalContent.style.height = '';
            modalContent.style.margin = '20px auto';
            document.body.style.overflow = '';
        }

        displayStats();
    }

    function closeStatsModal() {
        const modal = document.getElementById('stats-modal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable body scrolling
    }

    document.getElementById('scoring-rules-btn').addEventListener('click', openRulesModal);
    document.querySelector('#scoring-rules-modal .close').addEventListener('click', closeRulesModal);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('scoring-rules-modal');
        if (event.target === modal) {
            closeRulesModal();
        }
    });

    function openRulesModal() {
        const modal = document.getElementById('scoring-rules-modal');
        const modalContent = modal.querySelector('.modal-content');
        
        modal.style.display = 'block';
        
        // Adjust modal for mobile
        if (window.innerWidth <= 600) {
            modalContent.style.height = '100%';
            modalContent.style.margin = '0';
            document.body.style.overflow = 'hidden'; // Prevent body scrolling
        } else {
            modalContent.style.height = '';
            modalContent.style.margin = '20px auto';
            document.body.style.overflow = '';
        }
    }
    
    function closeRulesModal() {
        const modal = document.getElementById('scoring-rules-modal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable body scrolling
    }

    keyboard.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'BUTTON') {
            const key = target.dataset.key;
            handleKeyPress(key);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (isGameOver) return;

        let key = e.key.toUpperCase();
        if (key === 'BACKSPACE') {
            e.preventDefault();
            handleKeyPress('Backspace');
        } else if (key === 'ENTER') {
            e.preventDefault();
            handleKeyPress('Enter');
        } else if (/^[A-Z]$/.test(key)) {
            e.preventDefault();
            handleKeyPress(key);
        }
    });

    newGameBtn.addEventListener('click', initGame);

    // Update event listeners
    document.getElementById('stats-button').addEventListener('click', openStatsModal);
    document.querySelector('.close').addEventListener('click', closeStatsModal);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('stats-modal');
        if (event.target === modal) {
            closeStatsModal();
        }
    });

    // Add resize listener to handle orientation changes
    window.addEventListener('resize', () => {
        if (document.getElementById('stats-modal').style.display === 'block') {
            openStatsModal(); // Re-adjust modal
        }
    });

    // Start a new game when the page loads
    initGame();
});