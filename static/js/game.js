document.addEventListener('DOMContentLoaded', () => {
    let currentRow = 0;
    let currentTile = 0;
    let isGameOver = false;
    let timerInterval;
    let score = 0;

    const gameBoard = document.getElementById('game-board');
    const keyboard = document.getElementById('keyboard');
    const messageArea = document.getElementById('message-area');
    const newGameBtn = document.getElementById('new-game-btn');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');

    const modal = document.getElementById('stats-modal');
    const closeModal = document.getElementById('close-modal');

    let totalTime = 5 * 60; // 5 minutes in seconds

    // Timer countdown logic
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

    // Function to handle game over scenario
    function endGame(message, won = false) {
        isGameOver = true;
        showMessage(message);
        clearInterval(timerInterval);

        let gameResult = {
            result: won ? 'win' : 'loss',
            time: 5 * 60 - totalTime, // Time spent in seconds
            guesses: currentRow + 1,
            score: score,
            date: new Date().toISOString()
        };

        storeGameResult(gameResult);
    }

    // Store the game result in cookies
    function storeGameResult(gameResult) {
        let gameHistory = JSON.parse(getCookie('gameHistory') || '[]');
        gameHistory.push(gameResult);

        document.cookie = `gameHistory=${JSON.stringify(gameHistory)}; path=/; max-age=31536000`; // Store for 1 year
    }

// Function to display stats in a table format
function displayStats() {
    let gameHistory = JSON.parse(getCookie('gameHistory') || '[]');

    // Sort by the most recent game (descending by date)
    gameHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    let winCount = 0, lossCount = 0;
    let tableHtml = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Result</th>
                    <th>Time (s)</th>
                    <th>Guesses</th>
                    <th>Score</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    gameHistory.forEach(game => {
        if (game.result === 'win') winCount++;
        else lossCount++;

        tableHtml += `
            <tr>
                <td>${game.result === 'win' ? 'Win' : 'Loss'}</td>
                <td>${game.time}</td>
                <td>${game.guesses}</td>
                <td>${game.score}</td>
                <td>${new Date(game.date).toLocaleDateString()} ${new Date(game.date).toLocaleTimeString()}</td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
        <p>Total Wins: ${winCount}</p>
        <p>Total Losses: ${lossCount}</p>
    `;

    document.getElementById('stats-container').innerHTML = tableHtml;
}

    // Fetch the cookie value by name
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

    // Open modal
    document.getElementById('stats-button').addEventListener('click', () => {
        displayStats();
        modal.style.display = 'block';
    });

    // Close modal when user clicks on <span> (x)
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal if the user clicks outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

     // Prevent the modal from being shown on page load
     modal.style.display = 'none'; // Ensure the modal is hidden on page load

    // Function to handle key press
    function handleKeyPress(key) {
        if (isGameOver) return;

        if (key === 'Enter') {
            const currentGuess = getCurrentGuess();
            if (currentGuess.length === 5) {
                submitGuess();
            } else {
                showMessage('Not enough letters');
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

    // Get the current guess
    function getCurrentGuess() {
        return Array.from(gameBoard.children[currentRow].children)
            .map(tile => tile.textContent)
            .join('');
    }

    // Submit the guess
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
                showMessage(data.error);
                return;
            }

            if (!data.valid_word) {
                showMessage('Not in word list');
                return;
            }

            updateScore(data.result);
            updateRow(data.result);
            updateKeyboard(guess, data.result);

            if (data.game_over) {
                endGame(data.secret_word === guess ? "Congratulations! You guessed the word!" : `Game over! The word was ${data.secret_word}`, data.secret_word === guess);
            } else {
                currentRow++;
                currentTile = 0;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.');
        });
    }

    // Update score logic
    function updateScore(result) {
        let roundScore = 0;
        for (let i = 0; i < result.length; i++) {
            if (result[i] === 'correct') {
                roundScore += (6 - currentRow) * 10;  // Higher score for early correct guesses
            } else if (result[i] === 'present') {
                roundScore += 5;  // Partial credit for present letters
            }
        }
        score += roundScore;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    // Update the current row with the guess result
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

    // Update keyboard color based on the guess
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

    // Show message on the screen
    function showMessage(message) {
        messageArea.textContent = message;
        messageArea.setAttribute('aria-label', message);
    }

    // Start a new game
    function startNewGame() {
        fetch('/new_game/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resetGame();
            }
        });
    }

    // Reset the game board for a new game
    function resetGame() {
        currentRow = 0;
        currentTile = 0;
        isGameOver = false;
        score = 0;
        totalTime = 5 * 60; // Reset timer
        messageArea.textContent = '';
        messageArea.setAttribute('aria-label', '');
        timerDisplay.textContent = "05:00"; // Reset timer display
        scoreDisplay.textContent = "Score: 0"; // Reset score display
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

    // Add keyboard and button event listeners
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

    newGameBtn.addEventListener('click', startNewGame);

    // Start countdown and new game on page load
    startCountdown();
    startNewGame(); // Start a new game on page load
});
