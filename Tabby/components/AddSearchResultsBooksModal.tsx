import React, { useState } from 'react';
import { Modal, Pressable, Text, FlatList, View } from 'react-native';
import { Book } from '@/types/book';
import { Checkbox } from 'expo-checkbox';
import BookSearchPreview from '@/components/BookSearchPreview';

interface AddSearchResultsBooksModalProps {
    visible: boolean;
    onClose: () => void;
    booksToAdd: Book[];
    categories: string[]; // Categories passed as props
    onConfirmAddBooks: (booksSelectedToAdd: Book[], categoriesSelected: string[]) => Promise<boolean>; // Async success handler for adding books 
}

const AddSearchResultsBooksModal: React.FC<AddSearchResultsBooksModalProps> = ({
    visible,
    onClose,
    booksToAdd,
    categories,
    onConfirmAddBooks,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Toggle selection of categories
    const toggleCategorySelection = (category: string) => {
        // Clear error message if there is one
        if (errorMessage.length > 0) {
            setErrorMessage('');
        }
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((item) => item !== category); // Remove from selection
            } else {
                return [...prev, category]; // Add to selection
            }
        });
    };

    // Handle adding books to selected categories and trigger onSuccess with selected categories
    const handleAddBooks = async () => {
        console.log("length of selected categories: ", selectedCategories.length);
        if (selectedCategories.length === 0) {
            setErrorMessage('Please select at least one category.');
            return;
        }

        try {
            const result = await onConfirmAddBooks(booksToAdd, selectedCategories);
            if (!result) {
                setErrorMessage('Failed to add books to categories.');
            }


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
                <View className="">


                    <Text className="text-lg text-black font-semibold mb-4">
                        Select one or more categories to add the selected books to
                    </Text>
                </View>

                {/* Display the list of books to be added */}
                <Text className="font-semibold text-gray-800 mt-5 mb-2">
                    Books to add:
                </Text>
                <FlatList
                    className="max-h-52"
                    data={booksToAdd}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Pressable className='flex-row items-center p-4 rounded-lg my-1' onPress={() => { console.log("Selected book:", item) }}>
                            <BookSearchPreview book={item} />
                        </Pressable>

                    )}
                />


                {/* Category selection */}
                <FlatList
                    className="max-h-52"
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => toggleCategorySelection(item)}
                            className="flex-row items-center mb-2"
                        >
                            <Checkbox
                                value={selectedCategories.includes(item)} // Ensure the checkbox reflects the selected state
                                onValueChange={() => toggleCategorySelection(item)} // Toggle state properly
                            />
                            <Text className="ml-2 text-sm text-gray-800">{item}</Text>
                        </Pressable>
                    )}
                />



                {errorMessage.length > 0 && <Text className='text-red-500'>{errorMessage}</Text>}

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
