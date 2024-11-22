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
        
        -- Create userBooks table to store user's books: id will be uuid generated for book when it is added to db 
        CREATE TABLE IF NOT EXISTS userBooks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          excerpt TEXT,
          summary TEXT,
          image TEXT,
          rating INTEGER,
          genres TEXT,
          category TEXT,
          isFavorite INTEGER,
          publisher TEXT,               
          publishedDate TEXT,           
          pageCount INTEGER,
          isCustomBook INTEGER,
          isbn TEXT,
          notes TEXT          
        );

        -- Create recommendedBooks table to store recommended books: id will be uuid generated for book when it is added to db
        CREATE TABLE IF NOT EXISTS recommendedBooks (
          id TEXT PRIMARY KEY NOT NULL,
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
          pageCount INTEGER,
          isbn TEXT,
          notes TEXT             
        );
      `);

  console.log("Database initialized or migrated with new schema");
}

// function to drop all tables and create the tables again 
// use this if you have changed the tables and a device has an older version of the tables 
export async function dropAllTablesAndMigrate() {
  const db = SQLite.openDatabaseAsync('bookCollection.db');

  await (await db).execAsync(`
  PRAGMA journal_mode = WAL;

  -- delete tables if they exist
  DROP TABLE IF EXISTS userBooks;
  DROP TABLE IF EXISTS recommendedBooks;
  DROP TABLE IF EXISTS categories;
  
  -- Create categories table with name as the primary key 
  CREATE TABLE IF NOT EXISTS categories (
    name TEXT PRIMARY KEY NOT NULL,
    isPinned INTEGER NOT NULL,
    position INTEGER NOT NULL
  );
  
  -- Create userBooks table to store user's books: id will be isbn for book that is gotten from api otherwise it will be a uuid for custom book
  CREATE TABLE IF NOT EXISTS userBooks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    excerpt TEXT,
    summary TEXT,
    image TEXT,
    rating INTEGER,
    genres TEXT,
    category TEXT,
    isFavorite INTEGER,
    publisher TEXT,               
    publishedDate TEXT,           
    pageCount INTEGER,
    isCustomBook INTEGER,
    isbn TEXT,
    notes TEXT          
  );

  -- Create recommendedBooks table to store recommended books: id will be isbn for a recommended book
  CREATE TABLE IF NOT EXISTS recommendedBooks (
    id TEXT PRIMARY KEY NOT NULL,
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
    pageCount INTEGER,
    isbn TEXT,
    notes TEXT             
  );
`);

  console.log("Database was dropped and recreated with new schema");
}