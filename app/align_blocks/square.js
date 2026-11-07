"use client";

export default function Square({rowId, columnId, isSelected, isHighlighted, ballColour}) {
    return (
        <div
            style={{
                width: '110px',
                height: '110px',
                border: (!(isSelected || isHighlighted) ? '0.5px ' : '1px ') + (isSelected ? 'dashed' : 'solid') + (!(isSelected || isHighlighted) ? ' black' : ' blue'),
            }}>
            <b><code>&nbsp;{String.fromCharCode(65 + rowId) + "" + (columnId + 1)}</code></b>
            {(ballColour === 'P') && (<div style={{
                width: '75%',
                height: '75%',
                position: 'relative',
                margin: '0 auto',
                display: 'block',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 100px 100px, #5cabff, #000)'
            }}/>)}
            {(ballColour === 'C') && (<div style={{
                width: '75%',
                height: '75%',
                position: 'relative',
                margin: '0 auto',
                display: 'block',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 100px 100px, #ffab5c, #000)'
            }}/>)}
        </div>
    );
}