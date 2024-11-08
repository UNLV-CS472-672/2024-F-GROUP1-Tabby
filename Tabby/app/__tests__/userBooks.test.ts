import * as SQLite from 'expo-sqlite';
import { addUserBook, deleteUserBook, updateUserBook } from '@/database/databaseOperations';
import { Book } from '@/types/book';
import { migrateTestDbIfNeeded } from '@/database/testMigration';

let db: SQLite.SQLiteDatabase;

beforeAll(async () => {
    // Initialize the test database and apply migrations
    db = await SQLite.openDatabaseAsync('bookCollectionTest.db');
    await migrateTestDbIfNeeded();

    // clear out tables before running tests to avoid conflicts
    await db.runAsync('DELETE FROM userBooks');
    await db.runAsync('DELETE FROM recommendedBooks');
    await db.runAsync('DELETE FROM categories');
});

describe('User Books CRUD Operations', () => {
    const book: Book = {
        isbn: '1234567890',
        title: 'Test Book',
        author: 'Test Author',
        excerpt: 'This is a test excerpt.',
        summary: 'Test summary.',
        image: 'test_image.jpg',
        rating: 5,
        genres: ['Fiction'],
        isFavorite: true,
        addToLibrary: true,
    };

    test('should add a book to the userBooks table', async () => {
        await addUserBook(book);

        const result = await db.getAllAsync('SELECT * FROM userBooks WHERE isbn = ?', [book.isbn]);
        expect(result.length).toBeGreaterThan(0);
    });

    test('should update a user book by ISBN', async () => {
        book.title = 'Updated Test Book';
        await updateUserBook(book);

        const updatedBook = await db.getAllAsync('SELECT * FROM userBooks WHERE isbn = ?', [book.isbn]);

        // Type assertion to tell TypeScript that updatedBook is an array of Book objects
        const firstBook = updatedBook as Book[];

        // Now you can safely access properties
        expect(firstBook[0].title).toBe('Updated Test Book');
    });

    test('should delete a user book by ISBN', async () => {
        await deleteUserBook(book.isbn);
        const deletedBook = await db.getAllAsync('SELECT * FROM userBooks WHERE isbn = ?', [book.isbn]);
        expect(deletedBook.length).toBe(0);
    });
});

// Repeat similar CRUD tests for recommendedBooks and categories
