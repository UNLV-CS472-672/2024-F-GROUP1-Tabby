import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, ScrollView, Text, View } from 'react-native';
import {
    addUserBook, deleteUserBook, updateUserBook, getUserBookByIsbn,
    getAllUserBooks
} from '@/database/databaseOperations';
import { Book } from '@/types/book';
import { useSQLiteContext } from 'expo-sqlite';

const TestUserBooks = () => {
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [inputValues, setInputValues] = useState<Partial<Book>>({});
    const db = useSQLiteContext();

    const fetchBooks = async () => {
        const books = await getAllUserBooks();
        console.log(books);
        setUserBooks(books as Book[] || []);
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    /**
     * Opens a modal of a specified type and resets the input values.
     * 
     * @param type - The type of modal to open, which determines its purpose (e.g., 'addUserBook', 'deleteUserBook').
     */
    const openModal = (type: string) => {
        setModalType(type);
        setModalVisible(true);
        setInputValues({}); // Reset input values for each new modal session
    };

    const closeModal = () => setModalVisible(false);

    const handleInputChange = (key: keyof Book, value: string) => {
        setInputValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleAction = async () => {
        const bookData = inputValues as Book;

        switch (modalType) {
            case 'addUserBook':
                await addUserBook(bookData);
                break;
            case 'deleteUserBook':
                await deleteUserBook(bookData.isbn as string);
                break;
            case 'updateUserBook':
                await updateUserBook(bookData);
                break;
            case 'getUserBookByIsbn':
                const userBook = await getUserBookByIsbn(bookData.isbn as string);
                alert(JSON.stringify(userBook));
                break;
        }

        await fetchBooks(); // Refresh books after action
        closeModal();
    };

    const resetUserBooksTable = async () => {
        try {
            await db.runAsync('DELETE FROM userBooks');
            setUserBooks([]);
            alert('User Books table has been reset.');
        } catch (error) {
            console.error("Error resetting User Books table:", error);
            alert("Failed to reset User Books table.");
        }
    };

    return (
        <View>
            <Text className="font-bold text-lg mb-2">User Books:</Text>
            <ScrollView horizontal className="mb-4 p-2 bg-gray-100 rounded-lg max-h-32">
                {userBooks.map((book, index) => (
                    <Text key={index} className="mr-3 text-sm text-gray-700">{JSON.stringify(book)}</Text>
                ))}
            </ScrollView>
            <Button title="Add User Book" onPress={() => openModal('addUserBook')} />
            <Button title="Delete User Book" onPress={() => openModal('deleteUserBook')} />
            <Button title="Update User Book" onPress={() => openModal('updateUserBook')} />
            <Button title="Get User Book by ISBN" onPress={() => openModal('getUserBookByIsbn')} />
            <Button title="Reset User Books" onPress={resetUserBooksTable} color="#FF5252" />

            <Modal visible={modalVisible} transparent>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="w-72 p-5 bg-white rounded-lg">
                        <Text className="font-bold text-base mb-3">Enter Values</Text>
                        {['isbn', 'title', 'author', 'excerpt', 'summary', 'image', 'rating', 'genres', 'isFavorite', 'addToLibrary'].map((key) => (
                            <TextInput
                                key={key}
                                placeholder={key}
                                value={inputValues[key as keyof Book]?.toString() || ''}
                                onChangeText={(value) => handleInputChange(key as keyof Book, value)}
                                className="border-b border-gray-300 mb-3 p-2"
                            />
                        ))}
                        <Button title="Submit" onPress={handleAction} />
                        <Button title="Cancel" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TestUserBooks;
