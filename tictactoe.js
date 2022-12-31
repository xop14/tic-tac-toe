// Gameboard object module
const gameboard = (() => {
    const _arr = ['','','','','','','','',''];
    const _squares = document.querySelectorAll('.square');
    const _restartBtn = document.querySelector('#restart-btn');
    let _currentPlayer = 'p1';
    let _currentSymbol = 'x';
    let _isGameOver = false;
    
    // check if there is a winner
    const _checkForWinner = () => {
        let c = _currentSymbol;
        // check for rows of 3
        for (let i = 0; i < 9; i++) {
            // check horizontal lines
            if (i % 3 === 0 && _arr[i] === c && _arr[i+1] === c && _arr[i+2] === c) {
                display.set(`${_currentPlayer} (${_currentSymbol}) wins!`);
                return _currentPlayer;
            }
            // check vertical lines
            if (i < 3 && _arr[i] === c && _arr[i+3] === c && _arr[i+6] === c) {
                display.set(`${_currentPlayer} (${_currentSymbol}) wins!`);
                return _currentPlayer;
            }
            // check diagonal lines
            if (i === 4) {
                // from top-left
                if (_arr[i] === c && _arr[i-4] === c && _arr[i+4] === c) {
                    display.set(`${_currentPlayer} (${_currentSymbol}) wins!`);
                    return _currentPlayer;
                }
                // from top-right
                if (_arr[i] === c && _arr[i-2] === c && _arr[i+2] === c) {
                    display.set(`${_currentPlayer} (${_currentSymbol}) wins!`);
                    return _currentPlayer;
                }
            }
        }

        // restart game
        _restartBtn.onclick = () => {
            for (let i = 0; i < 9; i++) {
                _arr[i] = '';
            }
            _currentPlayer = 'p1';
            _currentSymbol = 'x';
            _isGameOver = false;
            _squares.forEach(square => {
                square.textContent = '';
            })
            display.clear();
            console.log('restarted');
        }

        // if array full and no winner game is tied
        if (_arr.includes('')) {
            return;
        } else {
            display.set('game tied');
            return 'game tied';
        }
    }

    // initiate squares
    _squares.forEach(square => {
        square.addEventListener('click', () => {
            if (!_arr[square.dataset.square] && !_isGameOver) {
                square.textContent = _currentSymbol;
                _arr[square.dataset.square] = _currentSymbol;
                if (_checkForWinner()) {
                    console.log('game over');
                    _isGameOver = true;
                }
                _currentSymbol = _currentSymbol === 'x' ? 'o' : 'x';
                _currentPlayer = _currentPlayer === 'p1' ? 'p2' : 'p1';
            }
        });
    });
})()



// player objects
function Player() {
    let wins = 0;
    const name = 'p1';
    return {wins};
}


// game logic


// displayController
const display = (() => {
    const _display = document.querySelector('.display');

    const set = (message) => {
        _display.textContent = message;
    }

    const clear = () => {
        _display.textContent = '';
    }

    return {set, clear};
})()