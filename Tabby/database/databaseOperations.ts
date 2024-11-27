import * as SQLite from "expo-sqlite";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
// need to import this so uuid can be used
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// Open the database sync
const db = SQLite.openDatabaseSync("bookCollection.db");

// ! === User Books CRUD Functions ===

// Add a new user book can be custom or not
export const addUserBook = async (book: Book): Promise<Book | null> => {
  console.log("Adding user book:", book);

  try {
    // all books will have a uuid as their uuid will allows for multiple categories having the same book
    book.id = uuidv4();
    await (await db).runAsync(
      `INSERT INTO userBooks (id, title, author, excerpt, summary, image, rating, genres, isFavorite, category, publisher, publishedDate, pageCount, isCustomBook, notes, isbn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        book.author,
        book.excerpt,
        book.summary,
        book.image,
        book.rating || null,
        book.genres || null,
        book.isFavorite ? 1 : 0,
        book.category || null,
        book.publisher || null,
        book.publishedDate || null,
        book.pageCount || null,
        book.isCustomBook ? 1 : 0,
        book.notes || null,
        book.isbn || null,
      ]
    );

    // Fetch and return the inserted book
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM userBooks WHERE id = ?", [book.id]);
    console.log("User book added successfully:", result);
    return result ? ({ ...result } as Book) : null;
  } catch (error) {
    console.error("Error adding user book:", error);
    return null;
  }
};

// add multiple user books to database with category name passed in
export const addMultipleUserBooksWithCategoryName = async (
  userBooks: Book[],
  category: string
): Promise<Boolean> => {
  try {
    for (const book of userBooks) {
      const updatedCategory = category;
      // generate unique id
      const id = uuidv4();
      await (await db).runAsync(
        `INSERT INTO userBooks (id, title, author, excerpt, summary, image, rating, genres, isFavorite, category, publisher, publishedDate, pageCount, isCustomBook, notes, isbn)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          book.title,
          book.author,
          book.excerpt,
          book.summary,
          book.image,
          book.rating || null,
          book.genres || null,
          book.isFavorite ? 1 : 0,
          updatedCategory || null,
          book.publisher || null,
          book.publishedDate || null,
          book.pageCount || null,
          book.isCustomBook ? 1 : 0,
          book.notes || null,
          book.isbn || null,
        ]
      );
    }
    console.log("User books added successfully with category name:", category);
    return true;
  } catch (error) {
    console.error("Error adding user books with category name:", error);
    return false;
  }
};

// Delete a user book by id
export const deleteMultipleUserBooksByIds = async (
  ids: string[]
): Promise<boolean> => {
  try {
    await (await db).runAsync(
      `DELETE FROM userBooks WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    );
    console.log("user books deleted successfully by ids");
    return true;
  } catch (error) {
    console.error("Error deleting user books by ids:", error);
    return false;
  }
};

// Delete a user book by id
export const deleteUserBookById = async (id: string): Promise<boolean> => {
  try {
    await (await db).runAsync(`DELETE FROM userBooks WHERE id = ?`, [id]);
    console.log("User book deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting user book:", error);
    return false;
  }
};

// delete user books that have category name passed in
export const deleteAllUserBooksByCategory = async (
  category: string
): Promise<boolean> => {
  try {
    await (await db).runAsync(`DELETE FROM userBooks WHERE category = ?`, [
      category,
    ]);
    console.log("User books deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting user books:", error);
    return false;
  }
};

// Update a user book by passing book object
export const updateUserBook = async (book: Book): Promise<boolean> => {
  console.log("--- Updating user book with this book:", book, "---");
  try {
    const result = await (
      await db
    ).runAsync(
      `UPDATE userBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, isFavorite = ?, category = ?, publisher = ?, publishedDate = ?, pageCount = ?, notes = ?, isbn = ? WHERE id = ?`,
      [
        book.title,
        book.author,
        book.excerpt,
        book.summary,
        book.image,
        book.rating || null,
        book.genres || null,
        book.isFavorite ? 1 : 0,
        book.category || null,
        book.publisher || null,
        book.publishedDate || null,
        book.pageCount || null,
        book.notes || null,
        book.isbn || null,
        book.id,
      ]
    );
    const getUpdatedResult = await getUserBookById(book.id);
    console.log("---User book updated successfully:", getUpdatedResult, "---");
    return getUpdatedResult ? true : false;
  } catch (error) {
    console.error("Error updating user book:", error);
    return false;
  }
};

// update an array of user books to have this category
export const updateMultipleUserBooksToHaveCategoryPassed = async (
  userBooks: Book[],
  category: string
): Promise<boolean> => {
  try {
    for (const book of userBooks) {
      const result = await (
        await db
      ).runAsync(`UPDATE userBooks SET category = ? WHERE id = ?`, [
        category,
        book.id,
      ]);
    }
    console.log("User books updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating user books:", error);
    return false;
  }
};

// Get all user books by category
export const getAllUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync("SELECT * FROM userBooks WHERE category = ?", [category]);
    console.log(`User books in category ${category}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all user books by isbn
export const getAllUserBooksByIsbn = async (
  isbn: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync("SELECT * FROM userBooks WHERE isbn = ?", [isbn]);
    console.log(`User books with isbn ${isbn}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(`Error retrieving user books with isbn ${isbn}:`, error);
    return null;
  }
};

// get all distinct category names from user books that have isbn passed in
export const getCategoryNamesWithIsbn = async (
  isbn: string
): Promise<string[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync("SELECT DISTINCT category FROM userBooks WHERE isbn = ?", [
      isbn,
    ]);
    console.log(`Category names with isbn ${isbn}:`, result);
    return result.map((item: any) => item.category) as string[];
  } catch (error) {
    console.error(`Error retrieving category names with isbn ${isbn}:`, error);
    return null;
  }
};

// Get all custom user books by category
export const getAllCustomUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE category = ? AND isCustomBook = 1",
      [category]
    );
    console.log(`User books in category ${category}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all non custom user books by category
export const getAllNonCustomUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE category = ? AND isCustomBook = 0",
      [category]
    );
    console.log(`User books in category ${category}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving user books in category ${category}:`,
      error
    );
    return null;
  }
};

// Get all user books
export const getAllUserBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync("SELECT * FROM userBooks");
    console.log("All user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all user books:", error);
    return null;
  }
};

// Get all custom user books
export const getAllCustomUserBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isCustomBook = 1"
    );
    console.log("All custom user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all custom user books:", error);
    return null;
  }
};

// Get all non-custom user books
export const getAllNonCustomUserBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isCustomBook = 0"
    );
    console.log("All non-custom user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all non-custom user books:", error);
    return null;
  }
};

// Get all favorite user books
export const getAllFavoriteUserBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1"
    );
    console.log("All favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all favorite user books:", error);
    return null;
  }
};

// get all non custom favorite user books
export const getAllNonCustomFavoriteUserBooks = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1 AND isCustomBook = 0"
    );
    console.log("All non-custom favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      "Error retrieving all non-custom favorite user books:",
      error
    );
    return null;
  }
};

// get all custom favorite user books
export const getAllCustomFavoriteUserBooks = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1 AND isCustomBook = 1"
    );
    console.log("All custom favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all custom favorite user books:", error);
    return null;
  }
};

// Get all non-favorite user books
export const getAllNonFavoriteUserBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0"
    );
    console.log("All non-favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all non-favorite user books:", error);
    return null;
  }
};

// Get all non-custom non-favorite user books
export const getAllNonCustomNonFavoriteUserBooks = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0 AND isCustomBook = 0"
    );
    console.log("All non-custom non-favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      "Error retrieving all non-custom non-favorite user books:",
      error
    );
    return null;
  }
};

// get all custom non-favorite user books
export const getAllCustomNonFavoriteUserBooks = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0 AND isCustomBook = 1"
    );
    console.log("All custom non-favorite user books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      "Error retrieving all custom non-favorite user books:",
      error
    );
    return null;
  }
};

// get all favorite user books by category
export const getAllFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1 AND category = ?",
      [category]
    );
    console.log(`All favorite user books in category ${category}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all custom favorite user books by category
export const getAllCustomFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1 AND category = ? AND isCustomBook = 1",
      [category]
    );
    console.log(
      `All custom favorite user books in category ${category}:`,
      result
    );
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all custom favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all non-custom favorite user books by category
export const getAllNonCustomFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 1 AND category = ? AND isCustomBook = 0",
      [category]
    );
    console.log(
      `All non-custom favorite user books in category ${category}:`,
      result
    );
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all non-custom favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all non-favorite user books by category
export const getAllNonFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0 AND category = ?",
      [category]
    );
    console.log(`All non-favorite user books in category ${category}:`, result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all non-favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all non-custom non-favorite user books by category
export const getAllNonCustomNonFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0 AND category = ? AND isCustomBook = 0",
      [category]
    );
    console.log(
      `All non-custom non-favorite user books in category ${category}:`,
      result
    );
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all non-custom non-favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// get all custom non-favorite user books by category
export const getAllCustomNonFavoriteUserBooksByCategory = async (
  category: string
): Promise<Book[] | null> => {
  try {
    const result = await (
      await db
    ).getAllAsync(
      "SELECT * FROM userBooks WHERE isFavorite = 0 AND category = ? AND isCustomBook = 1",
      [category]
    );
    console.log(
      `All custom non-favorite user books in category ${category}:`,
      result
    );
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      `Error retrieving all custom non-favorite user books in category ${category}:`,
      error
    );
    return null;
  }
};

// Get a user book by id
export const getUserBookById = async (id: string): Promise<Book | null> => {
  try {
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM userBooks WHERE id = ?", [id]);
    console.log("--- User book by id:", result, "---");
    if (result) {
      return {
        ...result,
      } as Book;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user book by id:", error);
    return null;
  }
};

// ! === Recommended Books CRUD Functions ===

// Add a new recommended book
export const addRecommendedBook = async (book: Book): Promise<Book | null> => {
  console.log("Adding recommended book:", book);

  try {
    // all books will have a uuid as their id allows for multiple categories having the same book
    book.id = uuidv4();
    await (await db).runAsync(
      `INSERT INTO recommendedBooks (id, title, author, excerpt, summary, image, rating, genres, addToLibrary, publisher, publishedDate, pageCount, notes, isbn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        book.author,
        book.excerpt,
        book.summary,
        book.image,
        book.rating || null,
        book.genres || null,
        book.addToLibrary ? 1 : 0,
        book.publisher || null,
        book.publishedDate || null,
        book.pageCount || null,
        book.notes || null,
        book.isbn || null,
      ]
    );

    // Fetch and return the inserted book
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM recommendedBooks WHERE id = ?", [book.id]);
    console.log("Recommended book added successfully:", result);
    return result ? ({ ...result } as Book) : null;
  } catch (error) {
    console.error("Error adding recommended book:", error);
    return null;
  }
};

// Delete a recommended book by id which will be isbn for book from api
export const deleteRecommendedBookById = async (
  id: string
): Promise<boolean> => {
  try {
    await (await db).runAsync(`DELETE FROM recommendedBooks WHERE id = ?`, [
      id,
    ]);
    console.log("Recommended book deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting recommended book:", error);
    return false;
  }
};

// delete multiple recommended books by id array
export const deleteMultipleRecommendedBooksByIds = async (
  ids: string[]
): Promise<boolean> => {
  try {
    await (await db).runAsync(
      `DELETE FROM recommendedBooks WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`,
      ids
    );
    console.log("Recommended books deleted successfully by id");
    return true;
  } catch (error) {
    console.error("Error deleting recommended books by id:", error);
    return false;
  }
};

// delete multiple recommended books by isbn array
export const deleteRecommendedBooksByIsbns = async (
  isbns: string[]
): Promise<boolean> => {
  try {
    await (await db).runAsync(
      `DELETE FROM recommendedBooks WHERE isbn IN (${isbns
        .map(() => "?")
        .join(",")})`,
      isbns
    );
    console.log("Recommended books deleted successfully by isbn");
    return true;
  } catch (error) {
    console.error("Error deleting recommended books by isbn:", error);
    return false;
  }
};

// Update a recommended book by passing book object
export const updateRecommendedBook = async (book: Book): Promise<boolean> => {
  console.log("--- Updating recommended book with this book:", book, "---");

  try {
    await (
      await db
    ).runAsync(
      `UPDATE recommendedBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, addToLibrary = ?, publisher = ?, publishedDate = ?, pageCount = ?, notes = ?, isbn = ? WHERE id = ?`,
      [
        book.title,
        book.author,
        book.excerpt,
        book.summary,
        book.image,
        book.rating || null,
        book.genres || null,
        book.addToLibrary ? 1 : 0,
        book.publisher || null,
        book.publishedDate || null,
        book.pageCount || null,
        book.notes || null,
        book.isbn || null,
        book.id,
      ]
    );
    console.log("Recommended book updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating recommended book:", error);
    return false;
  }
};

// update multiple recommended books by book array passed to be added to library
export const updateMultipleRecommendedBooksToBeAddedToLibrary = async (
  books: Book[]
): Promise<boolean> => {
  try {
    for (const book of books) {
      const result = await (
        await db
      ).runAsync(`UPDATE recommendedBooks SET addToLibrary = 1 WHERE id = ?`, [
        book.id,
      ]);
    }
    console.log("Recommended books updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating recommended books:", error);
    return false;
  }
};

// Get all recommended books
export const getAllRecommendedBooks = async (): Promise<Book[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM recommendedBooks"
    );
    console.log("All recommended books:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error("Error retrieving all recommended books:", error);
    return null;
  }
};

// get all recommended books that are added to the library
export const getAllRecommendedBooksAddedToLibrary = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM recommendedBooks WHERE addToLibrary = 1"
    );
    console.log("All recommended books added to library:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      "Error retrieving all recommended books added to library:",
      error
    );
    return null;
  }
};

// Get all recommended books that are not added to the library
export const getAllRecommendedBooksNotAddedToLibrary = async (): Promise<
  Book[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM recommendedBooks WHERE addToLibrary = 0"
    );
    console.log("All recommended books not added to library:", result);
    return result.map((item: any) => ({
      ...item,
    })) as Book[];
  } catch (error) {
    console.error(
      "Error retrieving all recommended books not added to library:",
      error
    );
    return null;
  }
};

// Get a recommended book by id (should be id)
export const getRecommendedBookById = async (
  id: string
): Promise<Book | null> => {
  try {
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM recommendedBooks WHERE id = ?", [id]);
    console.log("Recommended book by id:", result);
    if (result) {
      return {
        ...result,
      } as Book;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving recommended book by id:", error);
    return null;
  }
};

// ! === Categories CRUD Functions ===

// Add a new category
export const addCategory = async (
  category: Category
): Promise<Category | null> => {
  try {
    await (await db).runAsync(
      `INSERT INTO categories (name, isPinned, position)
             VALUES (?, ?, ?)`,
      [category.name, category.isPinned ? 1 : 0, category.position]
    );

    // Fetch and return the inserted category
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM categories WHERE name = ?", [category.name]);
    console.log("Category added successfully:", result);
    return result as Category;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// Delete a category by name
export const deleteCategory = async (name: string): Promise<boolean> => {
  try {
    await (await db).runAsync(`DELETE FROM categories WHERE name = ?`, [name]);
    console.log("Category deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};

// Update a category by name
// Update a category by old name, allowing the new name and other fields to be set
export const updateCategory = async (oldName: string, category: Category) => {
  try {
    // Ensure oldName is provided to find the category
    if (!oldName) {
      throw new Error("Old category name is required to update.");
    }

    // Prepare the update query with dynamic fields (isPinned, position, and potentially name)
    const queryParams = [
      category.isPinned ? 1 : 0, // Convert boolean to 1/0 for isPinned
      category.position, // position
      category.name || oldName, // If the new name is provided, use it; otherwise, use the old name that was provided for the search
      oldName, // The old name to search for in the WHERE clause
    ];

    // Update query to modify the category details based on the old name
    const updateQuery = `
            UPDATE categories
            SET isPinned = ?, position = ?, name = ?
            WHERE name = ?
        `;

    // Execute the update query
    await (await db).runAsync(updateQuery, queryParams);

    console.log(
      `Category with name "${oldName}" updated successfully to "${category.name}"`
    );
  } catch (error) {
    console.error("Error updating category:", error);
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[] | null> => {
  try {
    const result = await (await db).getAllAsync("SELECT * FROM categories");
    console.log("All categories:", result);
    return result as Category[];
  } catch (error) {
    console.error("Error retrieving all categories:", error);
    return null;
  }
};

// Get all categories that are pinned
export const getAllPinnedCategories = async (): Promise<Category[] | null> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM categories WHERE isPinned = 1"
    );
    console.log("All pinned categories:", result);
    return result as Category[];
  } catch (error) {
    console.error("Error retrieving all pinned categories:", error);
    return null;
  }
};

// Get all categories that are not pinned
export const getAllNonPinnedCategories = async (): Promise<
  Category[] | null
> => {
  try {
    const result = await (await db).getAllAsync(
      "SELECT * FROM categories WHERE isPinned = 0"
    );
    console.log("All non-pinned categories:", result);
    return result as Category[];
  } catch (error) {
    console.error("Error retrieving all non-pinned categories:", error);
    return null;
  }
};

// Get a category by name
export const getCategoryByName = async (
  name: string
): Promise<Category | null> => {
  try {
    const result = await (
      await db
    ).getFirstAsync("SELECT * FROM categories WHERE name = ?", [name]);
    console.log("Specific category:", result);
    if (result) {
      return result as Category;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving category by name:", error);
    return null;
  }
};
