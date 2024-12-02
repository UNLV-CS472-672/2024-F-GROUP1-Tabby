import React from "react";
import { render, screen } from "@testing-library/react-native";
import { getAllCategories } from "@/database/databaseOperations";
import CategoriesPage from "@/app/library"; // Adjust this import path to your CategoriesPage component

// Mocking expo-font to prevent errors in tests
jest.mock("expo-font", () => {
  return {
    isLoaded: jest.fn(),
    forEach: jest.fn(),
    loadAsync: jest.fn(),
  };
});

// Mock all database operation functions
jest.mock("@/database/databaseOperations", () => ({
  getAllCategories: jest.fn(),
  addCategory: jest.fn(),
  deleteCategory: jest.fn(),
  updateCategory: jest.fn(),
  getAllUserBooksByCategory: jest.fn(),
  updateMultipleUserBooksToHaveCategoryPassed: jest.fn(),
  deleteAllUserBooksByCategory: jest.fn(),
  getAllRecommendedBooks: jest.fn(),
  addRecommendedBook: jest.fn(),
  deleteMultipleRecommendedBooksByIds: jest.fn(),
  addMultipleUserBooksWithCategoryName: jest.fn(),
  updateMultipleRecommendedBooksToBeAddedToLibrary: jest.fn(),

}));

jest.mock("expo-router", () => {
  return {
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ category: "default-category" }),
  };
});

jest.mock("@/assets/menu-icons/plus-icon.svg", () => "MockPlusIcon");


jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Ionicons",
    MaterialIcons: "MaterialIcons",
    Icon: "Icon",
  };
});

// Mock implementations for the tests
beforeEach(() => {
  jest.clearAllMocks(); // Clear previous mocks

  // Mock basic default implementations
  getAllCategories.mockResolvedValue([
    { name: "Fiction" },
    { name: "Non-Fiction" },
    { name: "Science Fiction" },
  ]);
});

describe("Categories Page", () => {
  it("should render the CategoriesPage component", async () => {
    render(<CategoriesPage />);

    // Check if the CategoriesPage component rendered correctly by verifying text
    expect(await screen.findByText("Fiction")).toBeTruthy();
    expect(await screen.findByText("Non-Fiction")).toBeTruthy();
    expect(await screen.findByText("Science Fiction")).toBeTruthy();
  });
});
