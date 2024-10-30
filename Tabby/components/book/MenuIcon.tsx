import React from 'react';
import { Svg, Path } from 'react-native-svg';
const MenuIcon: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
    const color = isSelected ? "#57d356" : "white";


    return (
        <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <Path d="M9.58325 13.4165H36.4166" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13.2693 23H32.436" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M16.8076 32.5835H28.3076" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
};

export default MenuIcon;
