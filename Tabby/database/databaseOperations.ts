import * as SQLite from 'expo-sqlite';
import { Book } from '@/types/book';
import { Category } from '@/types/category';

// Open the database
const db = SQLite.openDatabaseAsync('bookCollection.db');

// ! === User Books CRUD Functions ===

// Add a new user book
export const addUserBook = async (book: Book): Promise<Book | null> => {

    try {
        await (await db).runAsync(
            `INSERT INTO userBooks (isbn, title, author, excerpt, summary, image, rating, genres, isFavorite, category, publisher, publishedDate, pageCount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                book.isbn,
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
            ]
        );

        // Fetch and return the inserted book
        const result = await (await db).getFirstAsync('SELECT * FROM userBooks WHERE isbn = ?', [book.isbn]);
        console.log("User book added successfully:", result);
        return result ? { ...result } as Book : null;
    } catch (error) {
        console.error("Error adding user book:", error);
        return null;
    }
};

// Delete a user book by ISBN
export const deleteUserBook = async (isbn: string): Promise<boolean> => {
    try {
        await (await db).runAsync(
            `DELETE FROM userBooks WHERE isbn = ?`,
            [isbn]
        );
        console.log("User book deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting user book:", error);
        return false;
    }
};

// Update a user book by ISBN
export const updateUserBook = async (book: Book): Promise<boolean> => {
    try {
        await (await db).runAsync(
            `UPDATE userBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, isFavorite = ?, category = ?, publisher = ?, publishedDate = ?, pageCount = ? WHERE isbn = ?`,
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
                book.isbn,
            ]
        );
        console.log("User book updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating user book:", error);
        return false;
    }
};

// Get all user books by category
export const getUserBooksByCategory = async (category: string): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync(
            'SELECT * FROM userBooks WHERE category = ?',
            [category]
        );
        console.log(`User books in category ${category}:`, result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error(`Error retrieving user books in category ${category}:`, error);
        return null;
    }
};

// Get all user books
export const getAllUserBooks = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM userBooks');
        console.log("All user books:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all user books:", error);
        return null;
    }
};

// Get all favorite user books
export const getAllFavoriteUserBooks = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM userBooks WHERE isFavorite = 1');
        console.log("All favorite user books:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all favorite user books:", error);
        return null;
    }
};

// Get all non-favorite user books
export const getAllNonFavoriteUserBooks = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM userBooks WHERE isFavorite = 0');
        console.log("All non-favorite user books:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all non-favorite user books:", error);
        return null;
    }
};

// get all favorite user books by category
export const getAllFavoriteUserBooksByCategory = async (category: string): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync(
            'SELECT * FROM userBooks WHERE isFavorite = 1 AND category = ?',
            [category]
        );
        console.log(`All favorite user books in category ${category}:`, result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error(`Error retrieving all favorite user books in category ${category}:`, error);
        return null;
    }
};

// get all non-favorite user books by category
export const getAllNonFavoriteUserBooksByCategory = async (category: string): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync(
            'SELECT * FROM userBooks WHERE isFavorite = 0 AND category = ?',
            [category]
        );
        console.log(`All non-favorite user books in category ${category}:`, result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error(`Error retrieving all non-favorite user books in category ${category}:`, error);
        return null;
    }
}

// Get a user book by ISBN
export const getUserBookByIsbn = async (isbn: string): Promise<Book | null> => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM userBooks WHERE isbn = ?', [isbn]);
        console.log("User book by ISBN:", result);
        if (result) {
            return {
                ...result
            } as Book;
        }
        return null;
    } catch (error) {
        console.error("Error retrieving user book by ISBN:", error);
        return null;
    }
};

// ! === Recommended Books CRUD Functions ===

// Add a new recommended book
export const addRecommendedBook = async (book: Book): Promise<Book | null> => {


    try {
        await (await db).runAsync(
            `INSERT INTO recommendedBooks (isbn, title, author, excerpt, summary, image, rating, genres, addToLibrary, publisher, publishedDate, pageCount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                book.isbn,
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
            ]
        );

        // Fetch and return the inserted book
        const result = await (await db).getFirstAsync('SELECT * FROM recommendedBooks WHERE isbn = ?', [book.isbn]);
        console.log("Recommended book added successfully:", result);
        return result ? { ...result } as Book : null;
    } catch (error) {
        console.error("Error adding recommended book:", error);
        return null;
    }
};

// Delete a recommended book by ISBN
export const deleteRecommendedBook = async (isbn: string): Promise<boolean> => {
    try {
        await (await db).runAsync(
            `DELETE FROM recommendedBooks WHERE isbn = ?`,
            [isbn]
        );
        console.log("Recommended book deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting recommended book:", error);
        return false;
    }
};

// Update a recommended book by ISBN
export const updateRecommendedBook = async (book: Book): Promise<boolean> => {

    try {
        await (await db).runAsync(
            `UPDATE recommendedBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, addToLibrary = ?, publisher = ?, publishedDate = ?, pageCount = ? WHERE isbn = ?`,
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
                book.isbn,
            ]
        );
        console.log("Recommended book updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating recommended book:", error);
        return false;
    }
};

// Get all recommended books
export const getAllRecommendedBooks = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM recommendedBooks');
        console.log("All recommended books:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all recommended books:", error);
        return null;
    }
};

// get all reccomended books that are added to the library
export const getAllRecommendedBooksAddedToLibrary = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM recommendedBooks WHERE addToLibrary = 1');
        console.log("All recommended books added to library:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all recommended books added to library:", error);
        return null;
    }
}

// Get all recommended books that are not added to the library
export const getAllRecommendedBooksNotAddedToLibrary = async (): Promise<Book[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM recommendedBooks WHERE addToLibrary = 0');
        console.log("All recommended books not added to library:", result);
        return result.map((item: any) => ({
            ...item
        })) as Book[];
    } catch (error) {
        console.error("Error retrieving all recommended books not added to library:", error);
        return null;
    }
};

// Get a recommended book by ISBN
export const getRecommendedBookByIsbn = async (isbn: string): Promise<Book | null> => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM recommendedBooks WHERE isbn = ?', [isbn]);
        console.log("Recommended book by ISBN:", result);
        if (result) {
            return {
                ...result
            } as Book;
        }
        return null;
    } catch (error) {
        console.error("Error retrieving recommended book by ISBN:", error);
        return null;
    }
};

// ! === Categories CRUD Functions ===

// Add a new category
export const addCategory = async (category: Category): Promise<Category | null> => {
    try {
        await (await db).runAsync(
            `INSERT INTO categories (name, isPinned, position)
             VALUES (?, ?, ?)`,
            [
                category.name,
                category.isPinned ? 1 : 0,
                category.position,
            ]
        );

        // Fetch and return the inserted category
        const result = await (await db).getFirstAsync('SELECT * FROM categories WHERE name = ?', [category.name]);
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
        await (await db).runAsync(
            `DELETE FROM categories WHERE name = ?`,
            [name]
        );
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
            category.position,          // position
            category.name || oldName,   // If the new name is provided, use it; otherwise, use the old name that was provided for the search
            oldName                     // The old name to search for in the WHERE clause
        ];

        // Update query to modify the category details based on the old name
        const updateQuery = `
            UPDATE categories
            SET isPinned = ?, position = ?, name = ?
            WHERE name = ?
        `;

        // Execute the update query
        await (await db).runAsync(updateQuery, queryParams);

        console.log(`Category with name "${oldName}" updated successfully to "${category.name}"`);
    } catch (error) {
        console.error("Error updating category:", error);
    }
};


// Get all categories
export const getAllCategories = async (): Promise<Category[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM categories');
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
        const result = await (await db).getAllAsync('SELECT * FROM categories WHERE isPinned = 1');
        console.log("All pinned categories:", result);
        return result as Category[];
    } catch (error) {
        console.error("Error retrieving all pinned categories:", error);
        return null;
    }
}

// Get all categories that are not pinned
export const getAllNonPinnedCategories = async (): Promise<Category[] | null> => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM categories WHERE isPinned = 0');
        console.log("All non-pinned categories:", result);
        return result as Category[];
    } catch (error) {
        console.error("Error retrieving all non-pinned categories:", error);
        return null;
    }
}

// Get a category by name
export const getCategoryByName = async (name: string): Promise<Category | null> => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM categories WHERE name = ?', [name]);
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