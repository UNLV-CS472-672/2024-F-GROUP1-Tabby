import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import RootLayout from '@/app/_layout'; // Adjust path as needed
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mocking SQLiteProvider to avoid database interaction during testing
jest.mock('expo-sqlite', () => ({
    SQLiteProvider: ({ children }) => <>{children}</>,
}));

// Mocking migrateDbIfNeeded to simulate a delay
jest.mock('@/database/migration', () => ({
    migrateDbIfNeeded: jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000))), // Simulate a delay
}));

// Mock the usePathname to simulate different paths
jest.mock('expo-router', () => ({
    usePathname: jest.fn(),
}));

describe('RootLayout', () => {
    it('renders loading spinner while database initializes', async () => {
        // Ensure usePathname is mocked correctly
        require('expo-router').usePathname.mockReturnValue('/');
        screen.debug();  // This will print out the current render tree.


        render(
            <SafeAreaProvider>
                <RootLayout />
            </SafeAreaProvider>
        );

        // Ensure the fallback (loading spinner) is displayed
        await waitFor(() => {
            expect(screen.getByTestId('LoadingSpinner')).toBeTruthy();
        });
    });

    it('renders FooterNavBar on non-welcome page', async () => {
        // Mock usePathname for a non-welcome page
        require('expo-router').usePathname.mockReturnValue('/some-page');

        render(
            <SafeAreaProvider>
                <RootLayout />
            </SafeAreaProvider>
        );

        // Ensure FooterNavBar is displayed
        await waitFor(() => {
            expect(screen.getByTestId('FooterNavBar')).toBeTruthy();
        });
    });

    it('does not render FooterNavBar on the welcome page', async () => {
        // Mock usePathname for the welcome page
        require('expo-router').usePathname.mockReturnValue('/');

        render(
            <SafeAreaProvider>
                <RootLayout />
            </SafeAreaProvider>
        );

        // Ensure FooterNavBar is not rendered
        await waitFor(() => {
            expect(screen.queryByTestId('FooterNavBar')).toBeNull();
        });
    });

    it('renders the content container and slot', async () => {
        // Mock usePathname to simulate any path
        require('expo-router').usePathname.mockReturnValue('/some-page');

        render(
            <SafeAreaProvider>
                <RootLayout />
            </SafeAreaProvider>
        );

        // Ensure the ContentContainer and Slot are rendered
        await waitFor(() => {
            expect(screen.getByTestId('ContentContainer')).toBeTruthy();
            expect(screen.getByTestId('Slot')).toBeTruthy();
        });
    });
});
