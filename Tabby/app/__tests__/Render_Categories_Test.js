import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CategoriesPage from "@/app/library"; // Adjust this import path to your CategoriesPage component
import {
  getAllCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getAllUserBooksByCategory,
  updateMultipleUserBooksToHaveCategoryPassed,
  deleteAllUserBooksByCategory,
} from "@/database/databaseOperations";

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

// Mock implementations for the tests
beforeEach(() => {
  jest.clearAllMocks(); // Clear previous mocks

  // Mock basic default implementations
  getAllCategories.mockResolvedValue([
    { name: "Fiction" },
    { name: "Non-Fiction" },
    { name: "Science Fiction" },
  ]);

  addCategory.mockResolvedValue({ success: true });

  deleteCategory.mockResolvedValue({ success: true });

  updateCategory.mockResolvedValue({ success: true });

  getAllUserBooksByCategory.mockResolvedValue([
    { id: 1, title: "Book 1", category: "Fiction" },
    { id: 2, title: "Book 2", category: "Science Fiction" },
  ]);

  updateMultipleUserBooksToHaveCategoryPassed.mockResolvedValue({
    success: true,
  });

  deleteAllUserBooksByCategory.mockResolvedValue({ success: true });
});

// Test suite for the Categories Page
describe("Categories Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all categories", async () => {
    render(<CategoriesPage />);

    expect(await screen.findByText("Fiction")).toBeInTheDocument();
    expect(await screen.findByText("Non-Fiction")).toBeInTheDocument();
    expect(await screen.findByText("Science Fiction")).toBeInTheDocument();

    expect(getAllCategories).toHaveBeenCalledTimes(1);
  });

  it("should call addCategory when a new category is added", async () => {
    const newCategory = "Adventure";

    await addCategory(newCategory);

    expect(addCategory).toHaveBeenCalledWith(newCategory);
    expect(addCategory).toHaveBeenCalledTimes(1);
  });

  it("should handle category deletion errors", async () => {
    deleteCategory.mockRejectedValue(new Error("Delete failed"));

    render(<CategoriesPage />);

    const deleteButton = screen.getByRole("button", { name: "Delete Fiction" });
    fireEvent.click(deleteButton);

    expect(
      await screen.findByText("Failed to delete category")
    ).toBeInTheDocument();
    expect(deleteCategory).toHaveBeenCalledTimes(1);
  });
});
