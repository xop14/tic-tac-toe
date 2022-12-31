// Gameboard object module
const gameboardModule = (() => {
    const _arr = ['','','','','','','','',''];
    const _squares = document.querySelectorAll('.square');
    let _currentPlayer = 'p1';
    let _currentSymbol = 'x';
    
    const _checkForWinner = () => {
        let c = _currentSymbol;
        // check for rows of 3
        for (let i = 0; i < 9; i++) {
            // check horizontal lines
            if (i % 3 === 0 && _arr[i] === c && _arr[i+1] === c && _arr[i+2] === c) {
                console.log(`${_currentPlayer} (${_currentSymbol}) wins!`);
                return _currentPlayer;
            }
            // check vertical lines
            if (i < 3 && _arr[i] === c && _arr[i+3] === c && _arr[i+6] === c) {
                console.log(`${_currentPlayer} (${_currentSymbol}) wins!`);
                return _currentPlayer;
            }
            // check diagonal lines
            if (i === 4) {
                // from top-left
                if (_arr[i] === c && _arr[i-4] === c && _arr[i+4] === c) {
                    console.log(`${_currentPlayer} (${_currentSymbol}) wins!`);
                    return _currentPlayer;
                }
                // from top-right
                if (_arr[i] === c && _arr[i-2] === c && _arr[i+2] === c) {
                    console.log(`${_currentPlayer} (${_currentSymbol}) wins!`);
                    return _currentPlayer;
                }
            }
        }

        // if array full and no winner game is tied
        if (_arr.includes('')) {
            return;
        } else {
            console.log('game tied');
            return 'game tied';
        }
    }


    _squares.forEach(square => {
        console.log(square);
        square.addEventListener('click', () => {
            if (_arr[square.dataset.square] === '') {
                square.textContent = _currentSymbol;
                _arr[square.dataset.square] = _currentSymbol;
                console.log(_arr);
                if (_checkForWinner()) {
                    console.log('game over');
                }
                _currentSymbol = _currentSymbol === 'x' ? 'o' : 'x';
                _currentPlayer = _currentPlayer === 'p1' ? 'p2' : 'p1';
            }
        });
    });
})()



// player objects