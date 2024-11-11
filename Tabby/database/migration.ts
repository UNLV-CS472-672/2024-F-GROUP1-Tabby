import * as SQLite from 'expo-sqlite';

// Function to initialize the database schema
export async function migrateDbIfNeeded() {
  const db = SQLite.openDatabaseAsync('bookCollection.db');

  await (await db).execAsync(`
        PRAGMA journal_mode = WAL;

        -- Create categories table with name as the primary key 
        CREATE TABLE IF NOT EXISTS categories (
          name TEXT PRIMARY KEY NOT NULL,
          isPinned INTEGER NOT NULL,
          position INTEGER NOT NULL
        );
        
        -- Create userBooks table 
        CREATE TABLE IF NOT EXISTS userBooks (
          isbn TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          excerpt TEXT,
          summary TEXT,
          image TEXT,
          rating INTEGER,
          genres TEXT,
          Category TEXT,
          isFavorite INTEGER,
          publisher TEXT,               
          publishedDate TEXT,           
          pageCount INTEGER             
        );

        -- Create recommendedBooks table
        CREATE TABLE IF NOT EXISTS recommendedBooks (
          isbn TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          excerpt TEXT,
          summary TEXT,
          image TEXT,
          rating INTEGER,
          genres TEXT,
          addToLibrary INTEGER,
          publisher TEXT,               
          publishedDate TEXT,           
          pageCount INTEGER             
        );
      `);

  console.log("Database initialized or migrated with new schema");
}
