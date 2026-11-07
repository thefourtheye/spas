"use client";
import Square from "@/app/align_blocks/square";

function countBalls(board, size, ball) {
    let count = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if ((board[i] || {})[j] === ball) count++;
        }
    }
    return count;
}

export default function Board({
    board,
    focused,
    selected,
    size,
    turn,
    winner,
}) {
    function createColumns(size, rowId) {
        return Array.from({ length: size }).map((elem, columnId) => {
            return (
                <td key={"td-" + rowId + "-" + columnId}>
                    <Square
                        rowId={rowId}
                        columnId={columnId}
                        isHighlighted={
                            rowId === focused[0] && columnId === focused[1]
                        }
                        isSelected={
                            rowId === selected[0] && columnId === selected[1]
                        }
                        ballColour={(board[rowId] || {})[columnId]}
                    />
                </td>
            );
        });
    }

    function createRows(size) {
        return Array.from({ length: size }).map((elem, rowId) => {
            return <tr key={rowId}>{createColumns(size, rowId)}</tr>;
        });
    }

    const ballsPlaced = countBalls(board, size, "P");
    let hint = "";
    if (!winner && turn === "P") {
        if (ballsPlaced < size) {
            hint = "Place a new ball: move to an empty square with the arrow keys and press Space.";
        } else if (selected[0] === undefined) {
            hint = "Pick a ball: move onto one of your balls and press Space.";
        } else {
            hint = "Move the ball: go to an empty square next to it and press Space. Press Space on the same ball to cancel.";
        }
    }

    return (
        <center>
            {winner && <h2>{winner} Won!!!</h2>}
            {!winner && turn === "P" && <h2>Player&apos;s Turn</h2>}
            {!winner && turn === "C" && <h2>Computer&apos;s Turn</h2>}
            {hint && <p><small>{hint}</small></p>}
            <table cellSpacing={9} cellPadding={9}>
                <tbody>{createRows(size)}</tbody>
            </table>
            <hr />
        </center>
    );
}
