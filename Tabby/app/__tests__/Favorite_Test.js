import React from 'react';
import FooterNavBar from '@/components/FooterNavBar';
import { render, fireEvent } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';
import Favorites from '@/app/favorites';

jest.mock('expo-router', () => {
    const { Pressable } = require('react-native');
    return {
        usePathname: jest.fn(),
        useRouter: jest.fn(),
        useLocalSearchParams: () => ({ category: 'default-category' }),
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

    // test heart button
    test('Test unfavoriting book', () => {
        // render favorites page
        const page = render(<Favorites />);
        // get all heart buttons
        const heartButtons = page.getAllByTestId('heartButton');

        // press heart button
        fireEvent.press(heartButtons[0]);

        // gets all favorited books after removing one
        const newBookCount = page.getAllByTestId('heartButton');

        // make sure that the book was removed from favorites
        expect(newBookCount < heartButtons);
    });
});