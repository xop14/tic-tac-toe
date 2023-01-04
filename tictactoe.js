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
        })
    };

    return {getSquare, setSquare, getArray, getMoves, clear};
})();



// game logic
const game = (() => {
    const _restartBtn = document.querySelector('#restart-btn');
    const _botLevelSelect = document.querySelector('#bot-level');
    let _currentSymbol = 'x';
    let _currentPlayer = p1;
    let _isGameOver = false;
    let _botLevel = 'very easy';

    // get & set bot level
    if (localStorage.getItem('botLevel')) {
        _botLevel = localStorage.getItem('botLevel');
        _botLevelSelect.value = _botLevel;
    }
    
    _botLevelSelect.addEventListener('input', () => {
        _botLevel = _botLevelSelect.value;
        localStorage.setItem('botLevel', _botLevel);
        console.log(_botLevel);
    });


    // methods
    const getSymbol = () => _currentSymbol;
    const getGameOverStatus = () => _isGameOver;
    const nextTurn = () => {

        // display winner
        if (checkForWinner(gameboard.getArray(), game.getSymbol())) {
            _isGameOver = true;
            display.show(`${_currentPlayer.getName()} (${_currentSymbol}) wins!`);
            _currentPlayer.increaseScore();
            display.updateScores();
        } else if (checkForWinner(gameboard.getArray(), game.getSymbol()) === false) {
            display.show('game tied');
        } else {
            _currentSymbol = _currentSymbol === 'x' ? 'o' : 'x';
            _currentPlayer = _currentPlayer === p1 ? bot : p1;
        }

        // initiate bot move
        if (_currentPlayer === bot && _isGameOver === false) {
            if (_botLevel === 'hard') {
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
        console.log('restarted');
    }

    return {getSymbol, nextTurn, getGameOverStatus};
})();



// check for winnner
function checkForWinner(arr, symbol) {
    
    // check for rows of 3
    for (let i = 0; i < 9; i++) {
        // check horizontal lines
        if (i % 3 === 0 && arr[i] === symbol && arr[i+1] === symbol && arr[i+2] === symbol) {
            return true;
        }
        // check vertical lines
        if (i < 3 && arr[i] === symbol && arr[i+3] === symbol && arr[i+6] === symbol) {
            return true;
        }
        // check diagonal lines
        if (i === 4) {
            // from top-left
            if (arr[i] === symbol && arr[i-4] === symbol && arr[i+4] === symbol) {
                return true;
            }
            // from top-right
            if (arr[i] === symbol && arr[i-2] === symbol && arr[i+2] === symbol) {
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
    }
    const updateScores = () => {
        _p1Score.textContent = p1.getScore();
        _botScore.textContent = bot.getScore();
    }
    const clear = () => {
        _display.textContent = '';
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

    const veryEasy = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
    
        // choose random space
        const randomSpace = Math.floor(Math.random()*freeSpaces.length);
        const botChoice = freeSpaces[randomSpace];
        gameboard.setSquare(botChoice, game.getSymbol());
        game.nextTurn();
    };

    const easy = () => {
        // get possible moves
        const freeSpaces = gameboard.getMoves();
        let found = false;

        for (let i = 0; i < freeSpaces.length; i++) {
            // clone current game array
            const tempArr = [...gameboard.getArray()];
    
            // check if p1 could win on next move and block
            tempArr[freeSpaces[i]] = 'x';
            // if p1 could win, go there
            if (checkForWinner(tempArr, 'x')) {
                gameboard.setSquare(freeSpaces[i], 'o');
                found = true;
                break;
            }
        }
        // if there is no situation where p1 or bot would win, choose a random square
        if (!found) {
            _chooseRandomSquare();
        }
        game.nextTurn();

    };

    const medium = () => {
        // find possible moves
        const freeSpaces = gameboard.getMoves();
        let found = false;

        for (let i = 0; i < freeSpaces.length; i++) {
            // clone current game array
            const tempArr = [...gameboard.getArray()];
    
            // check if bot could win on next move
            tempArr[freeSpaces[i]] = 'o';
            // if o could win, go there
            if (checkForWinner(tempArr, 'o')) {
                gameboard.setSquare(freeSpaces[i], 'o');
                found = true;
                break;
            }
    
            // check if p1 could win on next move
            tempArr[freeSpaces[i]] = 'x';
            // if p1 could win, go there
            if (checkForWinner(tempArr, 'x')) {
                gameboard.setSquare(freeSpaces[i], 'o');
                found = true;
                break;
            }
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
            for (let i = 0; i < freeSpaces.length; i++) {
                // clone current game array
                const tempArr = [...gameboard.getArray()];
    
                // check if bot could win on next move
                tempArr[freeSpaces[i]] = 'o';
                // if o could win, go there
                if (checkForWinner(tempArr, 'o')) {
                    gameboard.setSquare(freeSpaces[i], 'o');
                    found = true;
                    break;
                }
    
                // check if p1 could win on next move
                tempArr[freeSpaces[i]] = 'x';
                // if p1 could win, go there
                if (checkForWinner(tempArr, 'x')) {
                    gameboard.setSquare(freeSpaces[i], 'o');
                    found = true;
                    break;
                }
            }
            // if there is no situation where p1 or bot would win, choose a random square
            if (!found) {
                _chooseRandomSquare();
            }
        }
        game.nextTurn();
    };

    return {veryEasy, easy, medium, hard}
})()