// player factory function
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

// player objects
const p1 = new Player('Player 1');
const bot = new Player('Bot');


// gameboard module
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
    // use this for the winning squares animation 
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
    let _botLevel = 'medium';
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
            setTimeout(() => {
                if (_botLevel === 'very easy') {
                    botMove.move(3);
                } else if (_botLevel === 'easy') {
                    botMove.move(5);
                } else if (_botLevel === 'medium') {
                    botMove.move(7);
                } else if (_botLevel === 'hard') {
                    botMove.move(8);
                } else if (_botLevel === 'very hard') {
                    botMove.move(9);
                } else if (_botLevel === 'impossible') {
                    botMove.move(10);
                }
            }, 200);
            
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
        // choose one possible move at random
        const randomIndex = Math.floor(Math.random()*freeSpaces.length);
        gameboard.setSquare(freeSpaces[randomIndex], game.getSymbol());
    }

    // minimax is a recursive algorithm that finds the optimal move
    const _minimax = (arr, depth = 0, symbol = 'o') => {

        const nextSymbol = symbol === 'o' ? 'x' : 'o';
        let bestIndex;
        // set default best score depending on current symbol being checked
        let bestScore = symbol === 'o' ? -Infinity : Infinity;

        // return 0 is no free spaces
        if (!arr.includes('')) return {bestIndex: null, bestScore: 0}

        // check for winner & return
        for (let i = 0; i < arr.length; i++) {
            // check is space is empty and insert symbol if so
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
                        let score = _minimax(arr, depth + 1, nextSymbol).bestScore;
                        bestScore = Math.max(score, bestScore);
                        if (score === bestScore) {
                            bestIndex = i;
                        }
                    } else {
                        let score = _minimax(arr, depth + 1, nextSymbol).bestScore;
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

    const move = (level) => {
        // generate random number from 0 - 10
        let random = Math.round(Math.random(1)*10);

        // choose random space if random number is higher than current level
        // else play the ideal move using minimax
        if (random > level) {
            _chooseRandomSquare();
        } else {
            const arr = [...gameboard.getArray()];
            gameboard.setSquare(_minimax(arr).bestIndex, 'o');
        }
        game.nextTurn();
    }

    return {move}
})()