import React from 'react';
import { Svg, Path } from 'react-native-svg';
const AddButtonIcon: React.FC<{ isAdded: boolean }> = ({ isAdded }) => {
    //  use flag to determine the color of the first and second path if the icons was clicked or not
    const colorFirstPath = isAdded ? "#57d356" : "#C3C6CF";
    const colorSecondPath = isAdded ? "#57d356" : "#BCBFC8";
    return (
        <Svg width="45" height="45" viewBox="0 0 45 45" fill="none">
            <Path d="M22.5 11.25L22.5 33.75" stroke={colorFirstPath} strokeWidth="2" strokeLinecap="round" />
            <Path d="M33.75 22.5L11.25 22.5" stroke={colorSecondPath} strokeWidth="2" strokeLinecap="round" />
        </Svg>


    )

};

export default AddButtonIcon;
