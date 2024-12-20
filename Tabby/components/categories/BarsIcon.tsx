import React from 'react';
import { Svg, Path } from 'react-native-svg';
const BarsIcon: React.FC<{ color?: string, height?: number, width?: number }> = ({ color = "white", height = 30, width = 30 }) => {

    return (
        <Svg width={width} height={height} viewBox="0 -2 12 12" id="meteor-icon-kit__regular-bars-alt-s" fill="none" ><Path fillRule="evenodd" clipRule="evenodd" d="M0.85714 2C0.38376 2 0 1.55228 0 1C0 0.44772 0.38376 0 0.85714 0H11.1429C11.6162 0 12 0.44772 12 1C12 1.55228 11.6162 2 11.1429 2H0.85714zM0.85714 8C0.38376 8 0 7.5523 0 7C0 6.4477 0.38376 6 0.85714 6H11.1429C11.6162 6 12 6.4477 12 7C12 7.5523 11.6162 8 11.1429 8H0.85714z" fill={color} /></Svg>

    )

};

export default BarsIcon;
