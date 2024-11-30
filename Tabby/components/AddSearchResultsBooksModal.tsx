import React, { useState } from 'react';
import { Modal, Pressable, Text, FlatList, View } from 'react-native';
import { Book } from '@/types/book';
import { Checkbox } from 'expo-checkbox';
import BookSearchPreview from '@/components/BookSearchPreview';

interface AddSearchResultsBooksModalProps {
    visible: boolean;
    onClose: () => void;
    booksToAdd: Book[];
    categories: string[];
    onConfirmAddBooks: (booksSelectedToAdd: Book[], categoriesSelected: string[]) => Promise<boolean>;
}

const AddSearchResultsBooksModal: React.FC<AddSearchResultsBooksModalProps> = ({
    visible,
    onClose,
    booksToAdd,
    categories,
    onConfirmAddBooks,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [bookErrorMessage, setBookErrorMessage] = useState<string>('');
    const [categoryErrorMessage, setCategoryErrorMessage] = useState<string>('');

    // Toggle selection of categories
    const toggleCategorySelection = (category: string) => {
        // reset error messages
        if (categoryErrorMessage.length > 0) setCategoryErrorMessage('');
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
        );
    };

    // Toggle selection of books
    const toggleBookSelection = (book: Book) => {
        // reset error messages
        if (bookErrorMessage.length > 0) setBookErrorMessage('');
        setSelectedBooks((prev) =>
            prev.some((b) => b.id === book.id) ? prev.filter((b) => b.id !== book.id) : [...prev, book]
        );
    };

    // Handle adding books to selected categories
    const handleAddBooks = async () => {
        // reset error message
        setErrorMessage('');

        // category or book not selected so return early and set error messages
        const isCategorySelectedNone = selectedCategories.length === 0;
        const isBookSelectedNone = selectedBooks.length === 0;
        if (isCategorySelectedNone) {
            setCategoryErrorMessage('Please select at least one category.');
        }
        if (isBookSelectedNone) {
            setBookErrorMessage('Please select at least one book.');
        }
        if (isCategorySelectedNone || isBookSelectedNone) {
            return;
        }

        try {
            const result = await onConfirmAddBooks(selectedBooks, selectedCategories);
            if (!result) setErrorMessage('Failed to add books to categories.');
            // reset selected categories and books
            setSelectedCategories([]);
            setSelectedBooks([]);

        } catch (error) {
            console.error('Error adding books to categories:', error);
        }
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="p-4 m-4 bg-white rounded-lg mx-auto w-96">
                <Text className="text-lg text-black font-semibold mb-4">
                    Select one or more books to add:
                </Text>
                {/* Display the list of books to be added */}
                <FlatList
                    className="max-h-96"
                    data={booksToAdd}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isSelected = selectedBooks.some((b) => b.id === item.id);
                        return (
                            <Pressable
                                className={`flex-row items-center p-4 rounded-lg my-1 ${isSelected ? 'bg-blue-500 opacity-80' : ''}`}
                                onPress={() => toggleBookSelection(item)}
                            >
                                <BookSearchPreview book={item} />
                            </Pressable>
                        );
                    }}
                />

                <Text className="text-lg text-black font-semibold my-4">
                    Select one or more categories to add selected books:
                </Text>

                {/* Category selection */}
                <FlatList
                    className="max-h-28"
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => toggleCategorySelection(item)}
                            className="flex-row items-center mb-2"
                        >
                            <Checkbox
                                value={selectedCategories.includes(item)}
                                onValueChange={() => toggleCategorySelection(item)}
                            />
                            <Text className="ml-2 text-sm text-gray-800">{item}</Text>
                        </Pressable>
                    )}
                />

                <View className='py-1'>
                    {categoryErrorMessage.length > 0 && <Text className="text-red-500">{categoryErrorMessage}</Text>}
                    {bookErrorMessage.length > 0 && <Text className="text-red-500">{bookErrorMessage}</Text>}
                    {errorMessage.length > 0 && <Text className="text-red-500">{errorMessage}</Text>}
                </View>




                <View className="flex-row justify-between mt-4">
                    <Pressable
                        className="px-4 py-2 bg-blue-500 rounded-lg"
                        onPress={handleAddBooks}
                    >
                        <Text className="text-white">Confirm</Text>
                    </Pressable>
                    <Pressable
                        className="px-4 py-2 mr-2 bg-gray-300 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-gray-800">Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default AddSearchResultsBooksModal;
