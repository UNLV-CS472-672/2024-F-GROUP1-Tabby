import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

const TestingDB = () => {
    const db = useSQLiteContext();
    const [userBooks, setUserBooks] = useState<any[]>([]);

    // Load books from the database
    const loadBooks = async () => {
        const result = await db.getAllAsync('SELECT * FROM userBooks');
        setUserBooks(result);
        console.log("getting user books", result);
    };

    // Add a book to the database
    const addBook = async () => {
        const book = {
            isbn: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            excerpt: 'In my younger and more vulnerable years...',
            summary: 'A story about the Jazz Age in the United States...',
            image: 'https://example.com/gatsby.jpg',
            rating: 5,
            genres: JSON.stringify(['Classic', 'Fiction']),
            isFavorite: true,
            addToLibrary: true,
        };

        try {
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
                    book.genres,
                    book.isFavorite ? 1 : 0,
                    book.addToLibrary ? 1 : 0,
                ]
            );
            console.log('Book added successfully');
            loadBooks();
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    // Reset database by dropping and recreating tables
    const resetDatabase = async () => {
        try {
            await db.runAsync('DROP TABLE IF EXISTS userBooks');
            await db.runAsync(`
                CREATE TABLE IF NOT EXISTS userBooks (
                    isbn TEXT PRIMARY KEY,
                    title TEXT,
                    author TEXT,
                    excerpt TEXT,
                    summary TEXT,
                    image TEXT,
                    rating INTEGER,
                    genres TEXT,
                    isFavorite INTEGER,
                    addToLibrary INTEGER
                )
            `);
            console.log('Database reset successfully');
            loadBooks(); // Clear any existing state
        } catch (error) {
            console.error('Error resetting database:', error);
        }
    };

    useEffect(() => {
        loadBooks();
    }, []);

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <View className="my-5">
                <Text className="text-4xl font-bold mb-4 text-white">Favorite Categories</Text>
                <Text className="text-lg text-center mb-8 text-white">
                    Bruh SQL
                </Text>

                {/* Button to add a book */}
                <Button title="Add Book" onPress={addBook} />

                {/* Button to reset the database */}
                <Button title="Reset Database" onPress={resetDatabase} color="red" />

                {/* Display the list of books */}
                {userBooks.length > 0 ? (
                    <View className="mt-4">
                        {userBooks.map((book, index) => (
                            <Text key={index} className="text-white mb-2">
                                {book.title} by {book.author}
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text className="text-white mt-4">No books found</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

export default TestingDB;
