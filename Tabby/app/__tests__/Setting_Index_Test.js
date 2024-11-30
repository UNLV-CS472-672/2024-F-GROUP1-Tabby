import React from 'react';
import Setting from '@/app/setting';
import { render, fireEvent } from '@testing-library/react-native';

// Mock the SettingBar component with a displayName
jest.mock('@/components/SettingBar', () => {
    const { View, Text } = require('react-native');  // Import inside the mock function

    const MockSettingBar = ({ settingName, description, svg_icon }) => (
        <View>
            <Text>{settingName}</Text>
            <Text>{description}</Text>
            {svg_icon}
        </View>
    );

    MockSettingBar.displayName = 'SettingBar';

    return MockSettingBar;
});

// Mock EyeIcon and ShieldIcon with testID
jest.mock('@/components/settings/EyeIcon', () => {
    const { View } = require('react-native');
    const EyeIconMock = () => <View testID="EyeIcon" />;
    EyeIconMock.displayName = 'EyeIcon';  // Set displayName
    return EyeIconMock;
});

jest.mock('@/components/settings/ShieldIcon', () => {
    const { View } = require('react-native');  // Import inside the mock function
    const ShieldIcon = () => <View testID="ShieldIcon" />;
    ShieldIcon.displayName = 'ShieldIcon';
    return ShieldIcon;
});

describe('<Setting />', () => {
    it('should render the SettingBar components with the correct props', () => {
        const { getByText, getByTestId } = render(<Setting />);

        // Check if SettingBars are rendered with correct names and descriptions
        expect(getByText('Appearances')).toBeTruthy();
        expect(getByText('Theme, language, formatting')).toBeTruthy();
        expect(getByText('Security')).toBeTruthy();
        expect(getByText('App lock, Secure screen')).toBeTruthy();

        // Check if icons are rendered with the correct testIDs
        expect(getByTestId('EyeIcon')).toBeTruthy();
        expect(getByTestId('ShieldIcon')).toBeTruthy();
    });

    it('should handle button press (if buttons trigger navigation or actions)', () => {
        const { getByText } = render(<Setting />);

        // Check if pressing the buttons triggers the expected behavior
        fireEvent.press(getByText('Appearances'));
        fireEvent.press(getByText('Security'));
    });
});
