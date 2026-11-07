"use client";

const MODE_COLOUR = {
    place: '#2e7d32',
    pick: '#c62828',
    move: '#6a1b9a',
};

export default function Square({rowId, columnId, isSelected, isHighlighted, ballColour, mode}) {
    const marked = isSelected || isHighlighted;
    const colour = MODE_COLOUR[mode] || 'blue';
    let border = '0.5px solid black';
    if (isSelected) border = '4px dashed ' + colour;
    else if (isHighlighted) border = '4px solid ' + colour;
    return (
        <div
            style={{
                width: '110px',
                height: '110px',
                boxSizing: 'border-box',
                position: 'relative',
                border: marked ? border : '0.5px solid black',
            }}>
            <b><code>&nbsp;{String.fromCharCode(65 + rowId) + "" + (columnId + 1)}</code></b>
            {(ballColour === 'P') && (<div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '75%',
                height: '75%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 100px 100px, #5cabff, #000)'
            }}/>)}
            {(ballColour === 'C') && (<div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '75%',
                height: '75%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 100px 100px, #ffab5c, #000)'
            }}/>)}
        </div>
    );
}