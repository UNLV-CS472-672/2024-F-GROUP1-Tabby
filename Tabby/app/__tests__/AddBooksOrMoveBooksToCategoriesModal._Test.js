import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import AddBooksOrMoveBooksToCategoryModal from "@/components/AddBooksOrMoveBooksToCategoryModal";

const mockClose = jest.fn();
const mockAddBooks = jest.fn();
const mockMoveBooks = jest.fn();

const booksToAdd = [
  {
    id: "1",
    title: "Book 1",
    author: "Author 1",
    category: "Fiction",
    summary: "Summary 1",
    excerpt: "Excerpt 1",
    image: "Image 1",
    rating: 4,
  },
  {
    id: "2",
    title: "Book 2",
    author: "Author 2",
    category: "Non-fiction",
    summary: "Summary 2",
    excerpt: "Excerpt 2",
    image: "Image 2",
    rating: 3,
  },
];

const categories = ["Fiction", "Non-fiction", "Fantasy"];

describe("AddBooksOrMoveBooksToCategoryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to ensure no state leakage between tests
  });

  it("renders the modal with categories and books", () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Modal content should be visible
    expect(
      screen.getByText(
        "Select one or more categories to add the selected books to:"
      )
    ).toBeTruthy();

    // Check categories and books are rendered
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeTruthy();
    });
    booksToAdd.forEach((book) => {
      expect(
        screen.getByText(`•${book.title} by ${book.author}`)
      ).toBeTruthy();
    });
  });

  it("handles category selection and confirmation", async () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Simulate selecting a category
    const categoryButton = screen.getByText("Fiction");
    fireEvent.press(categoryButton);

    // Simulate pressing the "Confirm" button
    const confirmButton = screen.getByText("Confirm");
    fireEvent.press(confirmButton);

    // Ensure the onConfirmAddBooks function is called with the selected categories
    await waitFor(() => expect(mockAddBooks).toHaveBeenCalledWith(["Fiction"]));
  });

  it("shows error message when no categories are selected", async () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Simulate pressing the "Confirm" button without selecting any categories
    const confirmButton = screen.getByText("Confirm");
    fireEvent.press(confirmButton);

    // Error message should be shown
    expect(
      screen.getByText("Please select at least one category.")
    ).toBeTruthy();
  });

  it("toggles between Add and Move modes", () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Ensure default is "Add Books"
    expect(screen.getByText("Add Books:")).toBeTruthy();

    // Simulate switching to "Move Books" by pressing the switch
    const switchToggle = screen.getByTestId("add-or-move-switch");
    fireEvent(switchToggle, "valueChange", false); // Simulate changing the switch value to false (Move Books)

    // Wait for the UI to reflect the change
    waitFor(() => {
      // Ensure "Move Books" is displayed after the switch is toggled
      expect(screen.getByText("Move Books:")).toBeTruthy();
    });
  });

  it("shows loading spinner when in loading state", async () => {
    // Mock the add books to simulate loading state
    mockAddBooks.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Simulate selecting a category
    const categoryButtonFavorite = screen.getByText("Fiction");
    fireEvent.press(categoryButtonFavorite);

    const categoryButtonNonFavorite = screen.getByText("Non-fiction");
    fireEvent.press(categoryButtonNonFavorite);

    // Simulate the "Confirm" button press, which triggers loading
    const confirmButton = screen.getByText("Confirm");
    fireEvent.press(confirmButton);

    // Expect the loading spinner to be shown
    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });

  it("closes the modal when cancel is pressed", () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.press(cancelButton);

    // Ensure onClose function is called
    expect(mockClose).toHaveBeenCalled();
  });

  it("renders move books mode when onConfirmMoveBooks is passed", () => {
    render(
      <AddBooksOrMoveBooksToCategoryModal
        visible={true}
        onClose={mockClose}
        booksToAdd={booksToAdd}
        categories={categories}
        onConfirmAddBooks={mockAddBooks}
        onConfirmMoveBooks={mockMoveBooks}
      />
    );

    // Ensure default is "Add Books"
    expect(screen.getByText("Add Books:")).toBeTruthy();

    // Simulate switching to "Move Books" by pressing the switch
    const switchToggle = screen.getByTestId("add-or-move-switch");
    fireEvent(switchToggle, "valueChange", false); // Simulate changing the switch value to false (Move Books)

    // Wait for the UI to reflect the change
    waitFor(() => {
      // Ensure "Move Books" is displayed after the switch is toggled
      expect(screen.getByText("Move Books:")).toBeTruthy();
    });
  });
});
