"use client";
import Square from "@/app/align-blocks/square";


export default function Board({
                                  board,
                                  focused,
                                  selected,
                                  size,
                                  turn,
                                  winner
                              }) {
    function createColumns(size, rowId) {
        return Array.from({length: size}).map((elem, columnId) => {
            return (
                <td key={"td-" + rowId + "-" + columnId}>
                    <Square rowId={rowId} columnId={columnId}
                            isHighlighted={rowId === focused[0] && columnId === focused[1]}
                            isSelected={rowId === selected[0] && columnId === selected[1]}
                            ballColour={(board[rowId] || {})[columnId]}/>
                </td>
            );
        });
    }

    function createRows(size) {
        return Array.from({length: size}).map((elem, rowId) => {
            return (
                <tr key={rowId}>
                    {createColumns(size, rowId)}
                </tr>
            );
        });
    }

    return (
        <center>
            {winner && (<h2>{winner} Won!!!</h2>)}
            {!winner && turn === "P" && (<h2>Player's Turn</h2>)}
            {!winner && turn === "C" && (<h2>Computer's Turn</h2>)}
            <table cellSpacing={9} cellPadding={9}>
                <tbody>
                {createRows(size)}
                </tbody>
            </table>
            <hr/>
        </center>
    )
}