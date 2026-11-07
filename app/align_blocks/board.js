"use client";
import Square from "@/app/align_blocks/square";

function squareLabel(position) {
    return String.fromCharCode(65 + position[0]) + (position[1] + 1);
}

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
    computing,
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
                        mode={mode}
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
    const mode = ballsPlaced < size ? "place" : selected[0] === undefined ? "pick" : "move";
    let action = "";
    let subtext = "";
    if (!winner && turn === "P") {
        if (ballsPlaced < size) {
            action = "Place a new ball";
            subtext = "Move to an empty square with the arrow keys and press Space.";
        } else if (selected[0] === undefined) {
            action = "Pick a ball";
            subtext = "Move onto one of your balls and press Space.";
        } else {
            action = "Move the ball";
            subtext = "Go to an empty square next to it and press Space. Press Space on the same ball to cancel.";
        }
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
            }}
        >
            {action && (
                <p style={{ textAlign: "center", margin: "0.5rem 0" }}>
                    <b>{action}</b>
                    <br />
                    <small>{subtext}</small>
                </p>
            )}
            <table
                cellSpacing={9}
                cellPadding={9}
                style={{ margin: "0 auto", border: "none", width: "fit-content" }}
            >
                <tbody>{createRows(size)}</tbody>
            </table>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    width: "100%",
                    maxWidth: 480,
                    marginTop: "0.5rem",
                    fontFamily: "'latin modern mono', monospace",
                }}
            >
                <span>
                    Focused{" "}
                    <code
                        style={{
                            fontWeight: "bold",
                            background: "var(--bg2)",
                            padding: "0.2rem 0.5rem",
                        }}
                    >
                        {squareLabel(focused)}
                    </code>
                </span>
                <span style={{ fontWeight: "bold" }}>
                    {winner
                        ? `${winner} Won!!!`
                        : turn === "P"
                          ? "Player's Turn"
                          : computing
                            ? "Computer's Turn - Thinking..."
                            : "Computer's Turn"}
                </span>
                <span>
                    Selected{" "}
                    <code
                        style={{
                            fontWeight: "bold",
                            background: "var(--bg2)",
                            padding: "0.2rem 0.5rem",
                        }}
                    >
                        {selected[0] === undefined ? "-" : squareLabel(selected)}
                    </code>
                </span>
            </div>
        </div>
    );
}
