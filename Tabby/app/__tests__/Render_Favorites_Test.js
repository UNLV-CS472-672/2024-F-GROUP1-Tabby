import React from "react";
import { render } from "@testing-library/react-native";
import Favorites from "@/app/favorites";


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

describe("Favorites Component", () => {
    test("renders without crashing", () => {
        const favoritesPage = render(<Favorites />);
        expect(favoritesPage).toBeTruthy();
    });
});
