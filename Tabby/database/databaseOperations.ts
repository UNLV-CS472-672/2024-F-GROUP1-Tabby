import * as SQLite from 'expo-sqlite';
import { Book } from '@/types/book';
import { Category } from '@/types/category';

// Open the database
const db = SQLite.openDatabaseAsync('bookCollection.db');

// ! === User Books CRUD Functions ===

// Add a new user book
export const addUserBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

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
                genres,
                book.isFavorite ? 1 : 0,
                book.category || null,
                book.publisher || null,
                book.publishedDate || null,
                book.pageCount || null,
            ]
        );
        console.log("User book added successfully");
    } catch (error) {
        console.error("Error adding user book:", error);
    }
};

// Delete a user book by ISBN
export const deleteUserBook = async (isbn: string) => {
    try {
        await (await db).runAsync(
            `DELETE FROM userBooks WHERE isbn = ?`,
            [isbn]
        );
        console.log("User book deleted successfully");
    } catch (error) {
        console.error("Error deleting user book:", error);
    }
};

// Update a user book by ISBN
export const updateUserBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

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
                genres,
                book.isFavorite ? 1 : 0,
                book.category || null,
                book.publisher || null,
                book.publishedDate || null,
                book.pageCount || null,
                book.isbn,
            ]
        );
        console.log("User book updated successfully");
    } catch (error) {
        console.error("Error updating user book:", error);
    }
};

// Get all user books by category
export const getUserBooksByCategory = async (category: string) => {
    try {
        const result = await (await db).getAllAsync(
            'SELECT * FROM userBooks WHERE category = ?',
            [category]
        );
        console.log(`User books in category ${category}:`, result);
        return result;
    } catch (error) {
        console.error(`Error retrieving user books in category ${category}:`, error);
        return null;
    }
};

// Get all user books
export const getAllUserBooks = async () => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM userBooks');
        console.log("All user books:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving all user books:", error);
        return null;
    }
};

// Get a user book by ISBN
export const getUserBookByIsbn = async (isbn: string) => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM userBooks WHERE isbn = ?', [isbn]);
        console.log("User book by ISBN:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving user book by ISBN:", error);
        return null;
    }
};

// ! === Recommended Books CRUD Functions ===

// Add a new recommended book
export const addRecommendedBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

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
                genres,
                book.addToLibrary ? 1 : 0,
                book.publisher || null,
                book.publishedDate || null,
                book.pageCount || null,
            ]
        );
        console.log("Recommended book added successfully");
    } catch (error) {
        console.error("Error adding recommended book:", error);
    }
};

// Delete a recommended book by ISBN
export const deleteRecommendedBook = async (isbn: string) => {
    try {
        await (await db).runAsync(
            `DELETE FROM recommendedBooks WHERE isbn = ?`,
            [isbn]
        );
        console.log("Recommended book deleted successfully");
    } catch (error) {
        console.error("Error deleting recommended book:", error);
    }
};

// Update a recommended book by ISBN
export const updateRecommendedBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

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
                genres,
                book.addToLibrary ? 1 : 0,
                book.publisher || null,
                book.publishedDate || null,
                book.pageCount || null,
                book.isbn,
            ]
        );
        console.log("Recommended book updated successfully");
    } catch (error) {
        console.error("Error updating recommended book:", error);
    }
};

// Get all recommended books
export const getAllRecommendedBooks = async () => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM recommendedBooks');
        console.log("All recommended books:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving all recommended books:", error);
        return null;
    }
};

// Get a recommended book by ISBN
export const getRecommendedBookByIsbn = async (isbn: string) => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM recommendedBooks WHERE isbn = ?', [isbn]);
        console.log("Recommended book by ISBN:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving recommended book by ISBN:", error);
        return null;
    }
};


//! === Categories CRUD Functions ===

// Add a new category
export const addCategory = async (category: Category) => {
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
        console.log("Category added successfully");
    } catch (error) {
        console.error("Error adding category:", error);
    }
};

// Delete a category by name
export const deleteCategory = async (name: string) => {
    try {
        await (await db).runAsync(
            `DELETE FROM categories WHERE name = ?`,
            [name]
        );
        console.log("Category deleted successfully");
    } catch (error) {
        console.error("Error deleting category:", error);
    }
};

// Update a category by name
// Update a category by old name, allowing the new name and other fields to be set
export const updateCategory = async (oldName: string, category: Category) => {
    try {
        // Check if the old name is provided to find the category
        if (!oldName) {
            throw new Error("Old category name is required to update.");
        }

        // Prepare the update query with dynamic fields (isPinned, position, and potentially name)
        const queryParams = [
            category.isPinned ? 1 : 0, // Convert boolean to 1/0 for isPinned
            category.position,          // position
            category.name || oldName,   // Use the new name if available, else the old name for the search
            oldName                     // The old name to search for in the WHERE clause
        ];

        const updateQuery = `
            UPDATE categories
            SET isPinned = ?, position = ?, name = ?
            WHERE name = ?
        `;

        // Run the query to update the category
        await (await db).runAsync(updateQuery, queryParams);

        console.log(`Category with name "${oldName}" updated successfully to "${category.name}"`);
    } catch (error) {
        console.error("Error updating category:", error);
    }
};


// Get all categories
export const getAllCategories = async () => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM categories');
        console.log("all categories:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving all categories:", error);
        return null;
    }
};

// Get a category by name
export const getCategoryByName = async (name: string) => {
    try {
        const result = await (await db).getFirstAsync('SELECT * FROM categories WHERE name = ?', [name]);
        console.log("Specific category:", result);
        return result;
    } catch (error) {
        console.error("Error retrieving category by name:", error);
        return null;
    }
};



