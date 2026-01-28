import React from 'react';
import '../css/Skeleton.css';

const Skeleton = ({ type = 'text', width, height, style, className }) => {
    const classes = `skeleton skeleton-${type} ${className || ''}`;
    const customStyle = {
        width,
        height,
        ...style
    };

    return <div className={classes} style={customStyle}></div>;
};

export default Skeleton;
