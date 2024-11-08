import React from 'react';
import { usePathname } from "expo-router";
import FooterNavBar from '@/components/FooterNavBar';
import { render, fireEvent, act, screen } from '@testing-library/react-native';

// when opening modal 5000ms is not enough time to open when testing
// so doubling it here gives enough time
jest.setTimeout(10000);

jest.mock('expo-router', () => ({
    usePathname: jest.fn(() => '/library'),
    Link: ({ children }) => <>{children}</>,
}));

// check to see if Camera modal opens when button is pressed
test('Camera model opens', async () => {
    // renders the navbar 
    const page = render(<FooterNavBar />);
    // clicks on the camera button
    const cameraButton = page.getByTestId('CameraButton');

    // opens the modal
    await act(async () => {
        fireEvent.press(cameraButton);
    });

    const modalTest = await screen.findByText('Take Picture');

    expect(modalTest).toBeTruthy();
})

