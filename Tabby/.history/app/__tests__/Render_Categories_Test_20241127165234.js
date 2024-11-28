import React from "react";
import { render, screen } from "@testing-library/react-native";
import { getAllCategories } from "@/database/databaseOperations";
import CategoriesPage from "@/app/library"; // Adjust this import path to your CategoriesPage component

// Mocking expo-font to prevent errors in tests
jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn(),
}));

// Mock all database operation functions
jest.mock("@/database/databaseOperations", () => ({
  getAllCategories: jest.fn(),
  addCategory: jest.fn(),
  deleteCategory: jest.fn(),
  updateCategory: jest.fn(),
  getAllUserBooksByCategory: jest.fn(),
  updateMultipleUserBooksToHaveCategoryPassed: jest.fn(),
  deleteAllUserBooksByCategory: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Ionicons",
    MaterialIcons: "MaterialIcons",
    // Mock other icon components here as needed
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
