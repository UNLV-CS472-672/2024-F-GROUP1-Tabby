import React from 'react';
import FooterNavBar from '@/components/FooterNavBar';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';
import Favorites from '@/app/favorites';
import { getAllFavoriteUserBooks, updateUserBook, getAllCategories } from '@/database/databaseOperations';

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

// mocks to make expo sdk 52 stop throwing errors
jest.mock('expo-font', () => {
    return {
        isLoaded: jest.fn(),
        forEach: jest.fn(),
        loadAsync: jest.fn(),
    };
});

// mock database operations
jest.mock('@/database/databaseOperations', () => ({
    getAllFavoriteUserBooks: jest.fn(),
    updateUserBook: jest.fn(),
    getAllCategories: jest.fn(),
    addUserBook: jest.fn(),
}));

const mockBooks = [
    { id: '1', title: 'Book One', author: 'Author One', isFavorite: true },
    { id: '2', title: 'Book Two', author: 'Author Two', isFavorite: true },
];

const mockCategories = [
    { name: "fiction" },
    { name: 'non-fiction' },
    { name: 'climbing' },
];

// test relating to the favorites page
describe('Favorite tab tests', () => {
    beforeEach(() => {
        getAllFavoriteUserBooks.mockResolvedValue(mockBooks);
        updateUserBook.mockResolvedValue(null); // Simulate a successful database update
        getAllCategories.mockResolvedValue(mockCategories);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // make sure the favorites page opens 
    test('Favorites page opens', async () => {
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
    test('Test unfavoriting book', async () => {
        // render favorites page
        const page = render(<Favorites />);

        // wait for books to load
        await waitFor(() => expect(getAllFavoriteUserBooks).toHaveBeenCalledTimes(1));

        // get all heart buttons
        const heartButtons = page.getAllByTestId('heartButton');

        // make sure that first book is rendered
        expect(page.queryByText('Book One')).not.toBeNull();

        // press heart button
        await act(async () => {
            fireEvent.press(heartButtons[0]);
        });


        // wait to update user book
        await waitFor(() => expect(updateUserBook).toHaveBeenCalledWith({
            id: '1',
            title: 'Book One',
            author: 'Author One',
            isFavorite: false, // Expecting the book's favorite status to toggle
        }));

        // make sure that books are rerendered after removing one
        await waitFor(() => expect(getAllFavoriteUserBooks).toHaveBeenCalledTimes(2));
    });
});