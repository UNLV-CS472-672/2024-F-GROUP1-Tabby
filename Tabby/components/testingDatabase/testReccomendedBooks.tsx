import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, FlatList, Text, View, Switch } from 'react-native';
import {
    addRecommendedBook, deleteRecommendedBook, updateRecommendedBook, getRecommendedBookByIsbn,
    getAllRecommendedBooks
} from '@/database/databaseOperations';
import { Book } from '@/types/book';
import { useSQLiteContext } from 'expo-sqlite';

const TestRecommendedBooks = () => {
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [inputValues, setInputValues] = useState<Partial<Book>>({});
    const db = useSQLiteContext();

    const fetchBooks = async () => {
        const books = await getAllRecommendedBooks();
        console.log(books);
        setRecommendedBooks(books as Book[] || []);
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
            case 'addRecommendedBook':
                await addRecommendedBook(bookData);
                break;
            case 'deleteRecommendedBook':
                await deleteRecommendedBook(bookData.isbn as string);
                break;
            case 'updateRecommendedBook':
                await updateRecommendedBook(bookData);
                break;
            case 'getRecommendedBookByIsbn':
                const recommendedBook = await getRecommendedBookByIsbn(bookData.isbn as string);
                alert(JSON.stringify(recommendedBook));
                break;
        }

        await fetchBooks();
        closeModal();
    };

    const resetRecommendedBooksTable = async () => {
        try {
            await db.runAsync('DELETE FROM recommendedBooks');
            setRecommendedBooks([]);
            alert('Recommended Books table has been reset.');
        } catch (error) {
            console.error("Error resetting Recommended Books table:", error);
            alert("Failed to reset Recommended Books table.");
        }
    };

    return (
        <View>
            <Text className="font-bold text-lg mb-2">Recommended Books:</Text>
            <FlatList
                horizontal
                data={recommendedBooks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View className="mr-4 p-2 bg-gray-100 rounded-lg">
                        <Text className="text-sm text-gray-700">
                            {JSON.stringify(item, null, 2)}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
            <Button title="Add Recommended Book" onPress={() => openModal('addRecommendedBook')} />
            <Button title="Delete Recommended Book" onPress={() => openModal('deleteRecommendedBook')} />
            <Button title="Update Recommended Book" onPress={() => openModal('updateRecommendedBook')} />
            <Button title="Get Recommended Book by ISBN" onPress={() => openModal('getRecommendedBookByIsbn')} />
            <Button title="Reset Recommended Books" onPress={resetRecommendedBooksTable} color="#FF5252" />

            <Modal visible={modalVisible} transparent>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="w-72 p-5 bg-white rounded-lg">
                        <Text className="font-bold text-base mb-3">Enter Values</Text>
                        {[
                            'isbn', 'title', 'author', 'excerpt', 'summary', 'image',
                            'rating', 'genres', 'publisher', 'publishedDate', 'pageCount'
                        ].map((key) => (
                            <TextInput
                                key={key}
                                placeholder={key}
                                value={inputValues[key as keyof Book]?.toString() || ''}
                                onChangeText={(value) => handleInputChange(key as keyof Book, value)}
                                className="border-b border-gray-300 mb-3 p-2"
                            />
                        ))}
                        {/* Switches for boolean fields */}
                        <View className="flex-row items-center mb-3">
                            <Text>Add to Library:</Text>
                            <Switch
                                value={Boolean(inputValues.addToLibrary)}
                                onValueChange={(value) => handleInputChange('addToLibrary', value)}
                            />
                        </View>
                        <Button title="Submit" onPress={handleAction} />
                        <Button title="Cancel" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TestRecommendedBooks;
