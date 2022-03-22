import React from 'react'

function Container (props) {

    const containerStyle = {
        width: props.width,
        height: props.height,
        borderRadius: '3px',
        backgroundColor: '#FFFFFF',
        boxShadow: '3px 3px .1px #D4D4D4',
        padding: props.padding,
        margin: props.margin,
        display: props.display
    }

    return (
        <div style={containerStyle} className={props.className}>
            {props.children}
        </div>
    )
}

export default Container;