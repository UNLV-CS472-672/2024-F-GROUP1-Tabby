import React from 'react';
import FooterNavBar from '@/components/FooterNavBar';
import { render, fireEvent } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

jest.mock('expo-router', () => {
    const { Pressable } = require('react-native');
    return {
        usePathname: jest.fn(),
        useRouter: jest.fn(),
        Link: ({ href, children }) => (
            <Pressable onPress={() => require('expo-router').useRouter().push(href)}>
                {children}
            </Pressable>
        ),
    }
});

// test relating to the favorites page
describe('Favorite tab tests', () => {
    // make sure the favorites page opens 
    test('Favorites page opens', () => {
        // setup mock implementations
        const push = jest.fn();
        const pathname = '/library';
        usePathname.mockReturnValue(pathname);
        useRouter.mockReturnValue({ push });

        // render footer
        const page = render(<FooterNavBar />);
        // get favorites button
        const favoritesButton = page.getByTestId('favoritesButton');

        // press favorites button
        fireEvent.press(favoritesButton);

        // check if push is called with correct route
        expect(push).toHaveBeenCalledWith('/favorites');
    });
});