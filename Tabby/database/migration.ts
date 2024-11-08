import * as SQLite from 'expo-sqlite';

// Function to initialize the database schema
export async function migrateDbIfNeeded() {
    // Open the database
    const db = SQLite.openDatabaseAsync('bookCollection.db');
    await (await db).execAsync(`
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
    console.log("Database initialized or migrated if needed");
}
