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
        // Use `runAsync` to execute the INSERT operation
        await (await db).runAsync(
            `INSERT INTO userBooks (isbn, title, author, excerpt, summary, image, rating, genres, isFavorite, addToLibrary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                book.addToLibrary ? 1 : 0,
            ]
        );
        console.log("Book added successfully");
    } catch (error) {
        console.error("Error adding book:", error);
    }
};

// Delete a user book by ISBN
export const deleteUserBook = async (isbn: string) => {
    try {
        await (await db).runAsync(
            `DELETE FROM userBooks WHERE isbn = ?`,
            [isbn]
        );
        console.log("Book deleted successfully");
    } catch (error) {
        console.error("Error deleting book:", error);
    }
};

// Update a user book by ISBN
export const updateUserBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

    try {
        await (await db).runAsync(
            `UPDATE userBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, isFavorite = ?, addToLibrary = ? WHERE isbn = ?`,
            [
                book.title,
                book.author,
                book.excerpt,
                book.summary,
                book.image,
                book.rating || null,
                genres,
                book.isFavorite ? 1 : 0,
                book.addToLibrary ? 1 : 0,
                book.isbn,
            ]
        );
        console.log("Book updated successfully");
    } catch (error) {
        console.error("Error updating book:", error);
    }
};

// Get all user books
export const getAllUserBooks = async () => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM userBooks');
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
        return result;
    } catch (error) {
        console.error("Error retrieving user book by ISBN:", error);
        return null;
    }
};

// ! === Reccommended Books CRUD Functions ===

// Add a new recommended book
export const addRecommendedBook = async (book: Book) => {
    const genres = JSON.stringify(book.genres);

    try {
        await (await db).runAsync(
            `INSERT INTO recommendedBooks (isbn, title, author, excerpt, summary, image, rating, genres, isFavorite, addToLibrary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                book.isbn, book.title, book.author, book.excerpt, book.summary,
                book.image, book.rating || null, genres, book.isFavorite ? 1 : 0,
                book.addToLibrary ? 1 : 0,
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
            `UPDATE recommendedBooks SET title = ?, author = ?, excerpt = ?, summary = ?, image = ?, rating = ?, genres = ?, isFavorite = ?, addToLibrary = ? WHERE isbn = ?`,
            [
                book.title, book.author, book.excerpt, book.summary, book.image,
                book.rating || null, genres, book.isFavorite ? 1 : 0,
                book.addToLibrary ? 1 : 0, book.isbn,
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
            `INSERT INTO categories (name, isPinned, isSelected, position)
         VALUES (?, ?, ?, ?)`,
            [
                category.name, category.isPinned ? 1 : 0,
                category.isSelected ? 1 : 0, category.position,
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
export const updateCategory = async (category: Category) => {
    try {
        await (await db).runAsync(
            `UPDATE categories SET isPinned = ?, isSelected = ?, position = ? WHERE name = ?`,
            [
                category.isPinned ? 1 : 0, category.isSelected ? 1 : 0, category.position, category.name,
            ]
        );
        console.log("Category updated successfully");
    } catch (error) {
        console.error("Error updating category:", error);
    }
};


// Get all categories
export const getAllCategories = async () => {
    try {
        const result = await (await db).getAllAsync('SELECT * FROM categories');
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
        return result;
    } catch (error) {
        console.error("Error retrieving category by name:", error);
        return null;
    }
};
