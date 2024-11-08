import * as SQLite from 'expo-sqlite';

// Create a new SQLite instance specifically for testing
export async function migrateTestDbIfNeeded() {
    // Open the test database
    const db = await SQLite.openDatabaseAsync('bookCollectionTest.db');

    // Run migration logic (create tables if they don't exist)
    await db.runAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      isPinned INTEGER NOT NULL,
      isSelected INTEGER NOT NULL,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS userBooks (
      isbn TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      excerpt TEXT,
      summary TEXT,
      image TEXT,
      rating INTEGER,
      genres TEXT,
      isFavorite INTEGER,
      addToLibrary INTEGER
    );

    CREATE TABLE IF NOT EXISTS recommendedBooks (
      isbn TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      excerpt TEXT,
      summary TEXT,
      image TEXT,
      rating INTEGER,
      genres TEXT,
      isFavorite INTEGER,
      addToLibrary INTEGER
    );
  `);

    console.log("Test Database initialized or migrated if needed.");
}
