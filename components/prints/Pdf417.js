import React, { useEffect } from 'react';
import PDF417 from 'pdf417-generator';

export default function Pdf417(props) {
    useEffect(() => {
        const { stamp } = props;
        const canvas = document.getElementById("barcodeCanvas");
        PDF417.draw(stamp, canvas, 2, 6, 1);
    }, [props.stamp]);

    return (
        <canvas id="barcodeCanvas" />
    );
}

