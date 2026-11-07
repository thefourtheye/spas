function sq(row, col) {
    return row + "-" + col;
}

function findRun(board, size, i, j) {
    const seen = new Set();
    const ball = board[i][j];
    const Q = [{ row: i, col: j }];
    const reached = [];
    while (Q.length > 0) {
        const { row, col } = Q.shift();
        if (seen.has(sq(row, col))) {
            continue;
        }
        seen.add(sq(row, col));
        reached.push(sq(row, col));
        [
            getCoordinates({ row: row - 1, col, ball, size, board }),
            getCoordinates({ row: row + 1, col, ball, size, board }),
            getCoordinates({ row, col: col - 1, ball, size, board }),
            getCoordinates({ row, col: col + 1, ball, size, board }),
            getCoordinates({ row: row - 1, col: col - 1, ball, size, board }),
            getCoordinates({ row: row + 1, col: col + 1, ball, size, board }),
            getCoordinates({ row: row - 1, col: col + 1, ball, size, board }),
            getCoordinates({ row: row + 1, col: col - 1, ball, size, board }),
        ]
            .filter(Boolean)
            .forEach((value) => Q.push(value));
    }
    return {
        run: reached,
        runSize: reached.length,
        ball,
    };
}

function getCoordinates({ board, row, col, size, ball }) {
    if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size ||
        board[row][col] !== ball
    ) {
        return;
    }
    return { row, col };
}

function findRuns(board, size) {
    const runs = [];
    const seen = new Set();
    for (let i = 0; i < size; i++) {
        for (let col = 0; col < size; col++) {
            if (seen.has(sq(i, col)) || board[i][col] === "E") {
                continue;
            }
            const { run, runSize, ball } = findRun(board, size, i, col);
            runs.push({ runSize, ball });
            run.forEach((r) => seen.add(r));
        }
    }
    return runs;
}

function estimateBoard(board, size, isPlayerTurn) {
    const runSizeFactors = {};
    let currentFactor = 0.1;
    let playerScore = 0;
    let computerScore = 0;
    for (let i = size; i >= 2; i--) {
        runSizeFactors[i] = currentFactor;
        currentFactor = Math.max(0, currentFactor - 0.02);
    }
    for (const { ball, runSize } of findRuns(board, size)) {
        if (ball === "P") {
            playerScore += runSize * (runSizeFactors[runSize] || 0);
        } else {
            computerScore += runSize * (runSizeFactors[runSize] || 0);
        }
    }

    // Always return from computer's perspective
    return computerScore - playerScore;
}

function minimax(board, size, depth, maximisePlayer) {
    const gameResult = isOver(board, size);
    if (gameResult.isOver) {
        return gameResult.point;
    }

    if (depth <= 0) {
        return estimateBoard(board, size, maximisePlayer);
    }

    if (maximisePlayer) {
        let result = Number.NEGATIVE_INFINITY;
        const boards = enumerateNextMoves(board, size, "C");
        for (const possibleBoard of boards) {
            result = Math.max(
                result,
                minimax(possibleBoard, size, depth - 1, false)
            );
        }
        return result;
    } else {
        let result = Number.POSITIVE_INFINITY;
        const boards = enumerateNextMoves(board, size, "P");
        for (const possibleBoard of boards) {
            result = Math.min(
                result,
                minimax(possibleBoard, size, depth - 1, true)
            );
        }
        return result;
    }
}

function copyBoard(board) {
    return structuredClone(board);
}

function placeBallInEmptySquares(size, board, ball) {
    const boards = [];

    for (let i = 0; i < size; i++) {
        for (let col = 0; col < size; col++) {
            if (board[i][col] === "E") {
                const newBoard = copyBoard(board);
                newBoard[i][col] = ball;
                boards.push(newBoard);
            }
        }
    }

    return boards;
}

export function allBallsPositions(size, board, ball) {
    const result = [];
    for (let i = 0; i < size; i++) {
        for (let col = 0; col < size; col++) {
            if (board[i][col] === ball) {
                result.push([i, col]);
            }
        }
    }
    return result;
}

function possibleMovements(x, y, empties) {
    const result = [];
    for (const [x1, y1] of empties) {
        if (Math.abs(x - x1) <= 1 && Math.abs(y - y1) <= 1) {
            result.push([x1, y1]);
        }
    }
    return result;
}

function allPossibleBallMovements(size, board, ball) {
    const balls = allBallsPositions(size, board, ball);
    const empties = allBallsPositions(size, board, "E");
    const result = [];

    for (const [x1, y1] of balls) {
        for (const [x2, y2] of possibleMovements(x1, y1, empties)) {
            const newBoard = copyBoard(board);
            newBoard[x2][y2] = ball;
            newBoard[x1][y1] = "E";
            result.push(newBoard);
        }
    }

    return result;
}

function enumerateNextMoves(board, size, turn) {
    if (turn === "P") {
        const balls = allBallsPositions(size, board, "P");
        if (balls.length !== size) {
            return placeBallInEmptySquares(size, board, "P");
        }
        return allPossibleBallMovements(size, board, "P");
    } else if (turn === "C") {
        const balls = allBallsPositions(size, board, "C");
        if (balls.length !== size) {
            return placeBallInEmptySquares(size, board, "C");
        }
        return allPossibleBallMovements(size, board, "C");
    } else {
        return [];
    }
}

export default function getNextMove({ board, size, searchDepth }) {
    const boards = enumerateNextMoves(board, size, "C");
    let [bestScore, bestBoard] = [Number.NEGATIVE_INFINITY, null];
    for (const possibleBoard of boards) {
        const score = minimax(possibleBoard, size, searchDepth, false);
        if (score > bestScore) {
            bestScore = score;
            bestBoard = possibleBoard;
        }
    }
    return bestBoard;
}

function isReallyOver(straight) {
    const set = new Set(straight);
    const firstElementOfSet = [...set][0];
    if (set.size === 1 && firstElementOfSet !== "E") {
        return {
            isOver: true,
            winner: firstElementOfSet,
            point: firstElementOfSet === "C" ? 1 : -1, // Computer win = +1
        };
    }
    return {
        isOver: false,
    };
}

export function isOver(board, size) {
    for (let row = 0; row < size; row++) {
        let straight = "";
        for (let col = 0; col < size; col++) {
            straight += board[row][col];
        }
        const result = isReallyOver(straight);
        if (result.isOver) {
            return result;
        }
    }

    for (let col = 0; col < size; col++) {
        let straight = "";
        for (let row = 0; row < size; row++) {
            straight += board[row][col];
        }
        const result = isReallyOver(straight);
        if (result.isOver) {
            return result;
        }
    }

    {
        let straight = "";
        for (let idx = 0; idx < size; idx++) {
            straight += board[idx][idx];
        }
        const result = isReallyOver(straight);
        if (result.isOver) {
            return result;
        }
    }

    {
        let straight = "";
        for (let idx = 0; idx < size; idx++) {
            straight += board[idx][size - 1 - idx];
        }
        const result = isReallyOver(straight);
        if (result.isOver) {
            return result;
        }
    }

    return {
        isOver: false,
    };
}
