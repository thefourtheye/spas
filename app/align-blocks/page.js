"use client";
import {useEffect, useRef, useState} from "react";
import Board from "@/app/align-blocks/board";
import getNextMove, {allBallsPositions, isOver} from "@/app/align-blocks/engine";

function getEmptyBoard(size) {
    const board = {};
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            board[i] = board[i] || {};
            board[i][j] = "E";
        }
    }
    return board;
}

export default function Page() {
    const [focused, setFocused] = useState([0, 0]);
    const [selected, setSelected] = useState([undefined, undefined]);
    const [turn, setTurn] = useState("P");
    const [winner, setWinner] = useState(null);

    const [size, setSize] = useState(3);
    const [board, setBoard] = useState(getEmptyBoard(size));
    const sizeTextInputRef = useRef(null);

    useEffect(() => {
        document.addEventListener("keydown", keyDownHandler, false);
        return () => {
            document.removeEventListener("keydown", keyDownHandler, false);
        };
    }, [keyDownHandler]);

    function keyDownHandler(event) {
        if (turn !== 'P') {
            return;
        }

        if (event.key === "ArrowRight") {
            if (focused[1] + 1 < size) {
                setFocused([focused[0], focused[1] + 1]);
            }
        } else if (event.key === "ArrowLeft") {
            if (focused[1] - 1 >= 0) {
                setFocused([focused[0], focused[1] - 1]);
            }
        } else if (event.key === "ArrowDown") {
            if (focused[0] + 1 < size) {
                setFocused([focused[0] + 1, focused[1]]);
            }
        } else if (event.key === "ArrowUp") {
            if (focused[0] - 1 >= 0) {
                setFocused([focused[0] - 1, focused[1]]);
            }
        } else if (event.key === " ") {
            if (isEmpty(focused[0], focused[1]) && allBallsPositions(size, board, "P").length < size) {
                const newBoard = structuredClone(board);
                newBoard[focused[0]][focused[1]] = "P";
                setBoard(newBoard);
                setTurn("C");
            } else if (focused[0] === selected[0] && focused[1] === selected[1]) {
                setSelected([undefined, undefined]);
            } else if (undefined === selected[0] && undefined === selected[1]) {
                if (hasBall("P", focused[0], focused[1])) {
                    setSelected([focused[0], focused[1]]);
                }
            } else {
                moveBall();
            }
        }
    }

    function moveBall() {
        if (!hasBall("P", selected[0], selected[1])) {
            return;
        }

        if (!isEmpty(focused[0], focused[1])) {
            return;
        }

        if (!(Math.abs(selected[0] - focused[0]) <= 1 && Math.abs(selected[1] - focused[1]) <= 1)) {
            return;
        }

        setSelected([undefined, undefined]);

        const newBoard = structuredClone(board);
        newBoard[selected[0]][selected[1]] = "E";
        newBoard[focused[0]][focused[1]] = "P";
        setBoard(newBoard);

        setTurn("C");
    }

    function isEmpty(rowId, colId) {
        return board[rowId][colId] === "E";
    }

    function hasBall(ball, rowId, colId) {
        return board[rowId][colId] === ball;
    }

    if (turn !== "") {
        const gameResult = isOver(board, size);
        if (gameResult.isOver) {
            setTurn("");
            setWinner(gameResult.winner === "P" ? "Player" : "Computer");
            return;
        }
    }

    if (turn === 'C') {
        const newBoard = getNextMove({board, size, searchDepth: 10});
        setBoard(newBoard);
        setTurn("P");
        return;
    }


    function sizeChanged(evt) {
        const size = parseInt(sizeTextInputRef.current.value, 10);
        setSize(size);
        setBoard(getEmptyBoard(size));
        setWinner("");
        setTurn("P");
        setSelected([undefined, undefined]);
        setFocused([0, 0]);
    }

    return (
        <center>
            <h2>Align Blocks</h2>
            <div>
                <table cellPadding={15} cellSpacing={15} border={0}>
                    <tbody>
                    <tr>
                        <td>Size of Square</td>
                        <td>
                            <input
                                ref={sizeTextInputRef}
                                type="number"
                                id="size"
                                name="size"
                                defaultValue={size}
                            />
                        </td>
                    </tr>
                    <tr align={"center"}>
                        <td colSpan={2}>
                            <input type={"button"} value={"Reset"} onClick={sizeChanged}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <hr/>

            <Board
                board={board}
                setBoard={setBoard}
                size={size}
                turn={'P'}
                focused={focused}
                selected={selected}
                winner={winner}
            />

        </center>
    )
}