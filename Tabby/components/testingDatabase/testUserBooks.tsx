import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, FlatList, Text, View, Switch, Alert } from 'react-native';
import {
    addUserBook, deleteUserBookById, updateUserBook, getUserBookById,
    getAllUserBooks, getAllUserBooksByCategory, getAllFavoriteUserBooks,
    getAllNonFavoriteUserBooks, getAllFavoriteUserBooksByCategory, getAllNonFavoriteUserBooksByCategory
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
        setUserBooks(books as Book[] || []);
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const openModal = (type: string) => {
        setModalType(type);
        setModalVisible(true);
        setInputValues({});
    };

    const closeModal = () => setModalVisible(false);

    const handleInputChange = (key: keyof Book, value: string | boolean) => {
        setInputValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleAction = async () => {
        const bookData = inputValues as Book;

        switch (modalType) {
            case 'addUserBook':
                await addUserBook(bookData);
                break;
            case 'deleteUserBook':
                await deleteUserBookById(bookData.id as string);
                break;
            case 'updateUserBook':
                await updateUserBook(bookData);
                break;
            case 'getUserBookById':
                const userBook = await getUserBookById(bookData.id as string);
                Alert.alert("User Book", JSON.stringify(userBook, null, 2) || 'No book found.');
                break;
            case 'getBooksByCategory':
                await fetchBooksByCategory();
                break;
        }

        await fetchBooks();
        closeModal();
    };

    const fetchBooksByCategory = async () => {
        const category = inputValues.category as string;
        const books = await getAllUserBooksByCategory(category);
        Alert.alert(`Books in Category: ${category}`, JSON.stringify(books, null, 2) || 'No books found in this category.');
    };

    const resetUserBooksTable = async () => {
        try {
            await db.runAsync('DELETE FROM userBooks');
            setUserBooks([]);
            Alert.alert('User Books table has been reset.');
        } catch (error) {
            console.error("Error resetting User Books table:", error);
            Alert.alert("Failed to reset User Books table.");
        }
    };

    const handleGetFavorites = async () => {
        const favoriteBooks = await getAllFavoriteUserBooks();
        Alert.alert("Favorite Books", JSON.stringify(favoriteBooks, null, 2) || 'No favorite books found.');
    };

    const handleGetNonFavorites = async () => {
        const nonFavoriteBooks = await getAllNonFavoriteUserBooks();
        Alert.alert("Non-Favorite Books", JSON.stringify(nonFavoriteBooks, null, 2) || 'No non-favorite books found.');
    };

    const handleGetFavoritesByCategory = async () => {
        const category = inputValues.category as string;
        const favoriteBooksByCategory = await getAllFavoriteUserBooksByCategory(category);
        Alert.alert(`Favorite Books in Category: ${category}`, JSON.stringify(favoriteBooksByCategory, null, 2) || 'No favorite books found in this category.');
    };

    const handleGetNonFavoritesByCategory = async () => {
        const category = inputValues.category as string;
        const nonFavoriteBooksByCategory = await getAllNonFavoriteUserBooksByCategory(category);
        Alert.alert(`Non-Favorite Books in Category: ${category}`, JSON.stringify(nonFavoriteBooksByCategory, null, 2) || 'No non-favorite books found in this category.');
    };

    return (
        <View>
            <Text className="font-bold text-lg mb-2">User Books:</Text>
            <FlatList
                horizontal
                data={userBooks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View className="mr-4 p-2 bg-gray-100 rounded-lg max-h-80">
                        <Text className="text-sm text-gray-700">
                            {JSON.stringify(item, null, 2)}
                        </Text>
                    </View>
                )}
            />
            <Button title="Add User Book" onPress={() => openModal('addUserBook')} />
            <Button title="Delete User Book" onPress={() => openModal('deleteUserBook')} />
            <Button title="Update User Book" onPress={() => openModal('updateUserBook')} />
            <Button title="Get User Book by id" onPress={() => openModal('getUserBookById')} />
            <Button title="Get Books by Category" onPress={() => openModal('getBooksByCategory')} />
            <Button title="Get All Favorite Books" onPress={handleGetFavorites} />
            <Button title="Get All Non-Favorite Books" onPress={handleGetNonFavorites} />
            <Button title="Get Favorite Books by Category" onPress={() => openModal('getFavoritesByCategory')} />
            <Button title="Get Non-Favorite Books by Category" onPress={() => openModal('getNonFavoritesByCategory')} />
            <Button title="Reset User Books" onPress={resetUserBooksTable} color="#FF5252" />

            <Modal visible={modalVisible} transparent>
                <View className="flex-1 justify-center items-center">
                    <View className="w-72 p-5 bg-white rounded-lg">
                        <Text className="font-bold text-base mb-3">Enter Values</Text>
                        {['id', 'title', 'author', 'excerpt', 'summary', 'image', 'rating', 'genres', 'category', 'publisher', 'publishedDate', 'pageCount', 'notes', 'isbn'
                        ].map((key) => (
                            <TextInput
                                key={key}
                                placeholder={key}
                                value={inputValues[key as keyof Book]?.toString() || ''}
                                onChangeText={(value) => handleInputChange(key as keyof Book, value)}
                                className="border-b border-gray-300 mb-2 p-2"
                            />
                        ))}
                        <View className="flex-row items-center mb-3">
                            <Text>Favorite:</Text>
                            <Switch
                                key={"isFavorite"}
                                value={Boolean(inputValues.isFavorite)}
                                onValueChange={(value) => handleInputChange('isFavorite', value)}
                            />
                            <Text>Custom Book:</Text>
                            <Switch
                                key={"isCustomBook"}
                                value={Boolean(inputValues.isCustomBook)}
                                onValueChange={(tempValue) => handleInputChange('isCustomBook', tempValue)}
                            />
                        </View>
                        <Button title="Submit" onPress={modalType === 'getFavoritesByCategory' ? handleGetFavoritesByCategory : modalType === 'getNonFavoritesByCategory' ? handleGetNonFavoritesByCategory : handleAction} />
                        <Button title="Cancel" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TestUserBooks;
