function minimax(board, size, depth, maximisePlayer) {
    const gameResult = isOver(board, size);
    if (depth <= 0 || gameResult.isOver) {
        if (gameResult.isOver) {
            return gameResult.point;
        }
        return 0.5;
    }

    if (maximisePlayer) {
        let result = Number.NEGATIVE_INFINITY;
        const boards = enumerateNextMoves(board, size, "P");
        for (const possibleBoard of boards) {
            result = Math.max(result, minimax(possibleBoard, size, depth - 1, !maximisePlayer));
        }
        return result;
    } else {
        let result = Number.POSITIVE_INFINITY;
        const boards = enumerateNextMoves(board, size, "C");
        for (const possibleBoard of boards) {
            result = Math.min(result, minimax(possibleBoard, size, depth - 1, !maximisePlayer));
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
        for (let j = 0; j < size; j++) {
            if (board[i][j] === "E") {
                const newBoard = copyBoard(board);
                newBoard[i][j] = ball;
                boards.push(newBoard);
            }
        }
    }

    return boards;
}

export function allBallsPositions(size, board, ball) {
    const result = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === ball) {
                result.push([i, j]);
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
    if (turn === "player") {
        const balls = allBallsPositions(size, board, "P");
        if (balls.length !== size) {
            return placeBallInEmptySquares(size, board, "P");
        }
        return allPossibleBallMovements(size, board, "P");
    } else if (turn === "computer") {
        const balls = allBallsPositions(size, board, "C");
        if (balls.length !== size) {
            return placeBallInEmptySquares(size, board, "C");
        }
        return allPossibleBallMovements(size, board, "C");
    } else {
        return [];
    }
}

export default function getNextMove({
                                        board,
                                        size,
                                        searchDepth = 5
                                    }) {
    const boards = enumerateNextMoves(board, size, "computer");
    let [bestScore, bestBoard] = [Number.NEGATIVE_INFINITY, ""];
    for (const board of boards) {
        const score = minimax(board, size, searchDepth, false);
        if (bestScore < score) {
            bestScore = score;
            bestBoard = board;
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
            point: (firstElementOfSet === "P") ? -1 : 1
        };
    }
    return {
        isOver: false
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
        isOver: false
    }
}