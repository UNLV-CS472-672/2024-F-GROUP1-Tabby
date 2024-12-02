import React from 'react';
import { render } from '@testing-library/react-native';
import Settings from '@/app/settings'; // Update with the actual path to your component

describe('Settings Component', () => {
    it('renders correctly', () => {
        const { getByText, getByTestId } = render(<Settings />);

        // Check for the Text component
        expect(getByText('Settings Coming Soon ...')).toBeTruthy();

        // Check for the Image component
        const image = getByTestId('settings-image');
        expect(image.props.source).toEqual(require('@/assets/icons/app/icon.png'));
    });
});
