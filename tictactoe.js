// player objects
function Player(name) {
    let _name = name;
    let _score = 0;
    const getName = () => _name;
    const getScore = () => _score;
    const increaseScore = () => {
        _score += 1;
        return _score;
    }
    const clearScore = () => {
        _score = 0;
    }
    return {getName, getScore, increaseScore, clearScore};
}

const p1 = new Player('Player 1');
const bot = new Player('Bot');



// gameboard
const gameboard = (() => {
    const _arr = ['','','','','','','','',''];
    const _squares = document.querySelectorAll('.square');
    let _winningSquares = [];

    // initiate squares - each square div contains a data-index attribute
    _squares.forEach((square) => {
        square.addEventListener('click', () => {
            if (!getSquare(square.dataset.index) && !game.getGameOverStatus()) {
                setSquare(square.dataset.index, game.getSymbol());
                game.nextTurn();
            }
        })
    });

    // methods
    const getSquare = index => _arr[index];
    const setSquare = (index, symbol) => {
        _arr[index] = symbol;
        _squares[index].textContent = symbol;
    };
    const getArray = () => _arr;
    const getMoves = () => {
        // find free spaces
        const freeSpaces = [];
        for(let i = 0; i < 9; i++) {
            if (_arr[i] === '') {
                freeSpaces.push(i);
            }
        }
        return freeSpaces;
    }
    const clear = () => {
        for (let i = 0; i < 9; i++) {
            _arr[i] = '';
        }
        _squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('square-win');
        })
    };
    const setWinningSquares = (winningIndexArr) => {
        _winningSquares = winningIndexArr.sort();
    };
    const animateSquares = () => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                _squares[_winningSquares[i]].classList.add('square-win');
            }, 100 * i);
        }
    };

    return {getSquare, setSquare, getArray, getMoves, setWinningSquares, animateSquares, clear};
})();



// game logic
const game = (() => {
    const _restartBtn = document.querySelector('#restart-btn');
    const _botLevelSelect = document.querySelector('#bot-level');
    let _currentSymbol = 'x';
    let _currentPlayer = p1;
    let _isGameOver = false;
    let _botLevel = 'easy';
    _botLevelSelect.value = _botLevel;

    // check if bot level stored locally
    if (localStorage.getItem('botLevel')) {
        _botLevel = localStorage.getItem('botLevel');
        _botLevelSelect.value = _botLevel;
    }
    
    _botLevelSelect.addEventListener('input', () => {
        _botLevel = _botLevelSelect.value;
        localStorage.setItem('botLevel', _botLevel);
    });


    // methods
    const getSymbol = () => _currentSymbol;
    const getGameOverStatus = () => _isGameOver;
    const nextTurn = () => {

        // display winner
        if (checkForWinner(gameboard.getArray(), game.getSymbol())) {
            _isGameOver = true;
            display.show(`${_currentPlayer.getName()} wins!`);
            gameboard.animateSquares();
            _currentPlayer.increaseScore();
            display.updateScores();
        } else if (checkForWinner(gameboard.getArray(), game.getSymbol()) === false) {
            display.show("It's a tie...");
        } else {
            _currentSymbol = _currentSymbol === 'x' ? 'o' : 'x';
            _currentPlayer = _currentPlayer === p1 ? bot : p1;
        }

        // initiate bot move
        if (_currentPlayer === bot && _isGameOver === false) {
            if (_botLevel === 'impossible') {
                setTimeout(botMove.impossible, 200);
            } else if (_botLevel === 'hard') {
                setTimeout(botMove.hard, 200);
            } else if (_botLevel === 'medium') {
                setTimeout(botMove.medium, 200);
            } else if (_botLevel === 'easy') {
                setTimeout(botMove.easy, 200);
            } else if (_botLevel === 'very easy') {
                setTimeout(botMove.veryEasy, 200);
            }
        }
    };

    // restart game
    _restartBtn.onclick = () => {
        gameboard.clear();
        display.clear();
        _currentPlayer = p1;
        _currentSymbol = 'x';
        _isGameOver = false;
    }

    return {getSymbol, nextTurn, getGameOverStatus};
})();



// check for winnner
function checkForWinner(arr, symbol) {
    
    // check for rows of 3
    for (let i = 0; i < 9; i++) {
        // check horizontal lines
        if (i % 3 === 0 && arr[i] === symbol && arr[i+1] === symbol && arr[i+2] === symbol) {
            gameboard.setWinningSquares([i, i+1, i+2]);
            return true;
        }
        // check vertical lines
        if (i < 3 && arr[i] === symbol && arr[i+3] === symbol && arr[i+6] === symbol) {
            gameboard.setWinningSquares([i, i+3, i+6]);
            return true;
        }
        // check diagonal lines
        if (i === 4) {
            // from top-left
            if (arr[i] === symbol && arr[i-4] === symbol && arr[i+4] === symbol) {
                gameboard.setWinningSquares([i, i-4, i+4]);
                return true;
            }
            // from top-right
            if (arr[i] === symbol && arr[i-2] === symbol && arr[i+2] === symbol) {
                gameboard.setWinningSquares([i, i-2, i+2]);
                return true;
            }
        }
    }
    // if array full and no winner game is tied
    if (arr.includes('')) {
        return;
    } else {
        return false;
    }
}



// displayController
const display = (() => {
    const _display = document.querySelector('.display');
    const _p1Score = document.querySelector('.p1-score');
    const _botScore = document.querySelector('.bot-score');

    const show = (message) => {
        _display.textContent = message;
        let interval = 500;
        // set shorter interval time if tie
        if (message.includes('tie')) {
            interval = 200;
        }
        setTimeout(() => {
            _display.style.transitionDuration = '0.3s';
            _display.style.opacity = '1';
        }, interval)
    }
    const updateScores = () => {
        _p1Score.textContent = p1.getScore();
        _botScore.textContent = bot.getScore();
    }
    const clear = () => {
        _display.textContent = '';
        _display.style.transitionDuration = '0s';
        _display.style.opacity = '0';
    }

    return {show, updateScores, clear};
})()



// BOT MOVES
const botMove = (() => {
    const _chooseRandomSquare = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
        const randomIndex = Math.floor(Math.random()*freeSpaces.length);
        gameboard.setSquare(freeSpaces[randomIndex], game.getSymbol());
    }

    // check if bot can win on next move and go there
    const _attemptWin = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
        for (let i = 0; i < freeSpaces.length; i++) {
            // clone current game array
            const tempArr = [...gameboard.getArray()];
            tempArr[freeSpaces[i]] = 'o';
            // if o could win, go there
            if (checkForWinner(tempArr, 'o')) {
                gameboard.setSquare(freeSpaces[i], 'o');
                return true;
            }
        }
        return false;
    };

    // check if player can win on next move and block them
    const _attemptBlock = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
        for (let i = 0; i < freeSpaces.length; i++) {
            // clone current game array
            const tempArr = [...gameboard.getArray()];
            tempArr[freeSpaces[i]] = 'x';
            // if p1 could win, block them
            if (checkForWinner(tempArr, 'x')) {
                gameboard.setSquare(freeSpaces[i], 'o');
                return true;
            }
        }
        return false;
    }

    // bot levels
    const veryEasy = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
    
        // choose random space
        const randomIndex = Math.floor(Math.random()*freeSpaces.length);
        const botChoice = freeSpaces[randomIndex];
        gameboard.setSquare(botChoice, game.getSymbol());
        game.nextTurn();
    };

    const easy = () => {
        let found = _attemptBlock();
        // if there is no situation where p1 or bot would win, choose a random square
        if (!found) {
            _chooseRandomSquare();
        }
        game.nextTurn();

    };

    const medium = () => {
        let found = _attemptWin();
        if (!found) {
            found = _attemptBlock();
        }
        // if there is no situation where p1 or bot would win, choose a random square
        if (!found) {
            _chooseRandomSquare();
        }
        game.nextTurn();
    };

    const hard = () => {
        // find possible moves
        const freeSpaces = gameboard.getMoves();
        let found = false;
    
        if (freeSpaces.includes(4)) {
            // choose center square if available
            gameboard.setSquare(4, game.getSymbol());
        } else {
            found = _attemptWin();
            if (!found) {
                found = _attemptBlock();
            }
            // if there is no situation where p1 or bot would win, choose a random square
            if (!found) {
                _chooseRandomSquare();
            }
        }
        game.nextTurn();
    };

    const minimax = (arr, depth = 0, symbol = 'o') => {

        const nextSymbol = symbol === 'o' ? 'x' : 'o';
        let bestIndex;
        let bestScore = symbol === 'o' ? -Infinity : Infinity;

        if (!arr.includes('')) return {bestIndex: null, bestScore: 0}

        // check for bot winner
        for (let i = 0; i < arr.length; i++) {
            if (!arr[i]) {
                arr[i] = symbol;
                if (checkForWinner(arr, symbol)) {
                    if (symbol === 'o') {
                        let score = 10 - depth;
                        bestScore = Math.max(score, bestScore);
                        if (score === bestScore) {
                            bestIndex = i;
                        }
                    } else {
                        let score = depth - 10;
                        bestScore = Math.min(score, bestScore);
                        if (score === bestScore) {
                            bestIndex = i;
                        }
                    }
                } else {
                    if (symbol === 'o') {
                        let score = minimax(arr, depth + 1, nextSymbol).bestScore;
                        bestScore = Math.max(score, bestScore);
                        if (score === bestScore) {
                            bestIndex = i;
                        }
                    } else {
                        let score = minimax(arr, depth + 1, nextSymbol).bestScore;
                        bestScore = Math.min(score, bestScore);
                        if (score === bestScore) {
                            bestIndex = i;
                        }
                    }
                }
                arr[i] = '';
            }
        }
        return {bestIndex, bestScore}
    };

    const impossible = () => {
        // copy current array
        const arr = [...gameboard.getArray()];
        const nextMove = minimax(arr);
        gameboard.setSquare(nextMove.bestIndex, 'o');
        console.log('------------------')
        game.nextTurn();
    }

    return {veryEasy, easy, medium, hard, impossible}
})()