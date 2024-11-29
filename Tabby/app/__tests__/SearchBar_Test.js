import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Favorites from "@/app/favorites";
import Categories from "@/app/library";
import CategoryPage from "@/app/library/[category]";
import Recommendations from "@/app/recommendations";

// Mock expo-router
jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ category: "default-category" }),
}));

// Mock database operations
jest.mock("@/database/databaseOperations", () => ({
    getAllCategories: jest.fn(() => Promise.resolve([{ name: "Fiction", isPinned: false, isSelected: false, position: 0 }])), // Mock with dummy data
    addCategory: jest.fn(() => Promise.resolve()),
    deleteCategory: jest.fn(() => Promise.resolve()),
    updateCategory: jest.fn(() => Promise.resolve()),
    getAllUserBooksByCategory: jest.fn(() => Promise.resolve([{ id: 1, title: "Book 1", author: "Author 1", isbn: "ISBN 1", category: "Fiction", summary: "Summary 1", excerpt: "Excerpt 1", image: "Image 1", rating: 4 }])),
    updateMultipleUserBooksToHaveCategoryPassed: jest.fn(() => Promise.resolve()),
    deleteAllUserBooksByCategory: jest.fn(() => Promise.resolve()),
    getAllRecommendedBooks: jest.fn(() => Promise.resolve([{ id: 1, title: "Recommended Book 1", author: "Recommended Author 1", isbn: "ISBN 1", summary: "Summary 1", excerpt: "Excerpt 1", image: "Image 1", rating: 4 }])),
    addRecommendedBook: jest.fn(() => Promise.resolve()),
    deleteMultipleRecommendedBooksByIds: jest.fn(() => Promise.resolve()),
    addMultipleUserBooksWithCategoryName: jest.fn(() => Promise.resolve()),
    updateMultipleRecommendedBooksToBeAddedToLibrary: jest.fn(() => Promise.resolve()),
}));

// Mock expo-font to prevent errors from Expo SDK 52
jest.mock("expo-font", () => ({
    isLoaded: jest.fn(),
    forEach: jest.fn(),
    loadAsync: jest.fn(),
}));

// Mock SVG imports
jest.mock("@/assets/menu-icons/plus-icon.svg", () => "MockPlusIcon");
jest.mock("@/assets/menu-icons/search-icon.svg", () => "MockSearchIcon");


// Mock vector icons
jest.mock("@expo/vector-icons", () => ({
    Ionicons: "Ionicons",
    MaterialIcons: "MaterialIcons",
    Icon: "Icon",
}));


describe("Favorite tab test favorites page", () => {
    test("Correct search bar input for favorites page", async () => {
        const favoritesPage = render(<Favorites />);

        const searchBar = await favoritesPage.findByPlaceholderText(
            "Search by title, ISBN, or author..."
        );

        fireEvent.changeText(searchBar, "tempText");
        expect(searchBar.props.value).toBe("tempText");
    });
});

// Test suite for search bar functionality
describe("Favorite tab test everything else", () => {
    test("Correct search bar input for everything else", async () => {
        // Render categories page
        const categoriesPage = render(<Categories />);
        const searchBar2 = await categoriesPage.findByPlaceholderText(
            "Search by category name..."
        );
        fireEvent.changeText(searchBar2, "tempText2");
        expect(searchBar2.props.value).toBe("tempText2");

        // Render category page
        const categoryPage = render(<CategoryPage />);
        const searchBar3 = await categoryPage.findByPlaceholderText(
            "Search by title, author, genre, or isbn"
        );
        fireEvent.changeText(searchBar3, "tempText3");
        expect(searchBar3.props.value).toBe("tempText3");

        // Render recommendations page
        const recommendationsPage = render(<Recommendations />);
        const searchBar4 = await recommendationsPage.findByPlaceholderText(
            "Search by title, author, genre, or isbn"
        );
        fireEvent.changeText(searchBar4, "tempText4");
        expect(searchBar4.props.value).toBe("tempText4");
    });
});





