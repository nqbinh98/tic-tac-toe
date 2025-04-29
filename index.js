const Gameboard = (() => {
    const rows = 3;
    const columns = 3;
    const board = []

    const createBoard = () => {
        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < columns; c++) {
                board[r].push(Cell());
            }
        }
    }
    createBoard()


    const getBoard = () => board;

    const makeMove = (row, column, mark) => {
        const availableCell = board[row][column].getValue();
        if (availableCell != " " ) return false;
        board[row][column].addMove(mark); 
        return true;
    }

    const printBoard = () => {
        const boardWithCellValues = board.map(row => row.map(cell => cell.getValue()));
        console.log(boardWithCellValues);
    }

    // Check win 
    const checkWin = () => {
        // Check win horizontal
        for (let r = 0; r < rows; r++) {
            let c = 0;
            const first = board[r][c].getValue();
            if (first !== " " &&
                first === board[r][c + 1].getValue() &&
                first === board[r][c + 2].getValue()
            ) {
                console.log(first);
                return first;
            }
        }
        // Check win vertical
        for (let c = 0; c < columns; c++) {
            let r = 0;
            const first = board[r][c].getValue();
            if (first !== " " &&
                first === board[r + 1][c].getValue() &&
                first === board[r + 2][c].getValue()
            ) {
                console.log(first);
                return first;
            }
        }
        // Check win diagonal Left Down To Right
        const leftDownToRight = () => {
            let i = 0;
            const first = board[i][i].getValue();
            if (first !== " " &&
                first === board[i + 1][i + 1].getValue() &&
                first === board[i + 2][i + 2].getValue()
            ) {
                console.log(first);
                return first;
            }
        }
        // Check win diagonal Right Down To Left
        const RightDownToLeft = () => {
            let r = 0;
            let c = columns - 1;
            const first = board[r][c].getValue();
            if (first !== " " &&
                first === board[r + 1][c - 1].getValue() &&
                first === board[r + 2][c - 2].getValue()
            ) {
                console.log(first);
                return first;
            }
        }

        const diagonalLeftRight = leftDownToRight();
        const diagonalRightLeft = RightDownToLeft();
        
        if (diagonalLeftRight) {
            return diagonalLeftRight;
        } 

        if (diagonalRightLeft) {
            return diagonalRightLeft;
        }

        return false;
    }

    const checkTie = () => {
        const fullBoard = board.every(row => row.every(cell => cell.getValue() != " "))
        return fullBoard;
    }

    return {
        createBoard, printBoard, getBoard, makeMove, checkWin, checkTie
    }

})()

function Cell () {
    let value = " ";
    const addMove = (mark) => value = mark;
    const getValue = () => value;
    return {
        addMove, getValue
    };
}

function GameController (
    playerOneName,
    playerTwoName
) {
    const players = [
        {
            name: playerOneName,
            move: "X",
        }, 
        {
            name: playerTwoName,
            move: "O",
        }, 
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        return activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        Gameboard.printBoard();
        console.log(`${getActivePlayer().name}'s turn`)
    }

    const playRound = (row, column) => {
        console.log(`${getActivePlayer().name} is make move at row ${row} column ${column}`);
        const result = Gameboard.makeMove(row, column, getActivePlayer().move)
        if (!result) {
            console.log("This cell has already marked")
            return;
        }
        
        const isWin = Gameboard.checkWin();
        if (isWin) {
            console.log(`Player ${isWin} won the game`);
            return {winner: activePlayer};
        }
        
        const isTie = Gameboard.checkTie();
        if (isTie) {
            console.log("The game is tie!!!")
            return {tie: true};
        }

        printNewRound();
        switchPlayerTurn()
        return;
    }

    const resetGame = () => {
        activePlayer = players[0];
        Gameboard.createBoard()
    }

    return {
        getActivePlayer,
        getBoard: Gameboard.getBoard,
        playRound, 
        resetGame
    }
}

const ScreenController = (function () {
    const boardDiv = document.querySelector(".board");
    const playerTurnDiv = document.querySelector(".turn");
    const btnReset = document.querySelector(".btn-reset");
    let game;
    
    const setGame = (gaming) => {
        game = gaming;
        updateScreen()
    };
    
    const updateScreen = () => {
        if (!game) return;
        const activePlayer = game.getActivePlayer()
        boardDiv.textContent = "";        
        playerTurnDiv.textContent = `${activePlayer.name}'s turn`
        const board = game.getBoard();

        board.forEach((row, indexRow) => {
            row.forEach((cell, indexColumn) => {
                const cellBtn = document.createElement('button');
                cellBtn.classList.add("cell");
                cellBtn.dataset.column = indexColumn;
                cellBtn.dataset.row = indexRow;
                cellBtn.textContent = cell.getValue() ;
                boardDiv.appendChild(cellBtn);
            })
        })
    }
    
    let isGameActive = true;
    function clickHandleBoard (e) {
        if (isGameActive && game) {
            const selectedColumn = e.target.dataset.column;
            if (!selectedColumn) return; 
            const selectedRow = e.target.dataset.row;
            const getResult = game.playRound(selectedRow, selectedColumn);
            
            if (getResult && getResult.winner) {
                isGameActive = false;
                updateScreen();
                playerTurnDiv.textContent = `${getResult.winner.name} has won the game`;
                return; 
            } else if (getResult && getResult.tie) {
                console.log(getResult);
                isGameActive = false;
                updateScreen();
                playerTurnDiv.textContent = `Tie!!!`;
                return; 
            }
            updateScreen();
        } else {
            return;
        }
    }

    function handleResetBtn (e) {
        game.resetGame()
        isGameActive = true;
        updateScreen()
        return;
    }
    btnReset.addEventListener("click", handleResetBtn)
    boardDiv.addEventListener("click", clickHandleBoard);
    return {
        setGame,
        updateScreen, 
    }
})()

const formGame = document.querySelector(".form-game");
const modal = document.querySelector(".modal");
const btnPlay = document.querySelector(".playBtn");

formGame.addEventListener("submit", handleForm);
function handleForm (e) {
    e.preventDefault()
    const playerOne = document.querySelector("#nameOne").value;
    const playerTwo = document.querySelector("#nameTwo").value;
    modal.classList.add('hide');
    const game = GameController(playerOne, playerTwo);
    ScreenController.setGame(game)
}