import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Settings = () => (
  <Svg
    fill="#939FB2"
    width="40"
    height="40"
    viewBox="-2 -4 24 24"
    preserveAspectRatio="xMinYMin"
    className="jam jam-settings-alt"
  >
    <Path d="M9 12V1a1 1 0 1 1 2 0v11h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1H8a1 1 0 0 1 0-2h1zm7-10V1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2h-1v11a1 1 0 0 1-2 0V4h-1a1 1 0 0 1 0-2h1zM4 5h1a1 1 0 1 1 0 2H4v8a1 1 0 0 1-2 0V7H1a1 1 0 1 1 0-2h1V1a1 1 0 1 1 2 0v4z" />
  </Svg>
);

export default Settings;
