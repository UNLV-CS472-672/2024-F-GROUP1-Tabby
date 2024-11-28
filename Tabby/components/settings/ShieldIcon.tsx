import React from 'react';
import { Svg, Path } from 'react-native-svg';

type ShieldIconProps = {
    width?: number;
    height?: number;
};

const ShieldIcon: React.FC<ShieldIconProps> = ({ width = 55, height = 55 }) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 55 55"
            fill="none">

            <Path
                d="M30.2082 8.03586L42.1527 13.1549C42.9953 13.5161 43.5416 14.3446 43.5416 15.2613V27.2992C43.5416 31.7398 41.3971 35.907 37.7837 38.488L30.164 43.9307C28.5704 45.069 26.4296 45.069 24.836 43.9307L17.2163 38.488C13.6028 35.907 11.4583 31.7398 11.4583 27.2992V15.2613C11.4583 14.3446 12.0046 13.5161 12.8472 13.1549L24.7918 8.03586C26.5212 7.29469 28.4788 7.29469 30.2082 8.03586Z"
                fill="#8995A8"
            />
        </Svg>
    );
};

export default ShieldIcon;
