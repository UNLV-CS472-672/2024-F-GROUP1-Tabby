import React, { useState } from "react";
import { Modal, Pressable, Text, FlatList, View, Switch } from "react-native";
import { Checkbox } from "expo-checkbox";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AddOrMoveSingleBookModalProps {
    visible: boolean;
    onClose: () => void;
    categories: string[]; // Categories passed as props
    onConfirmAddBook: (categoriesSelected: string[]) => Promise<boolean>; // Async success handler for adding book
    onConfirmMoveBook?: (categoriesSelected: string[]) => Promise<void>; // Async success handler for moving book
}

const AddOrMoveSingleBookModal: React.FC<AddOrMoveSingleBookModalProps> = ({
    visible,
    onClose,
    categories,
    onConfirmAddBook,
    onConfirmMoveBook,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    // checking if possible to move book
    const isPossibleToMoveBook = onConfirmMoveBook !== undefined;
    // true means will be adding book false means will be moving book by default will set to adding book
    const [addOrMoveBook, setAddOrMoveBook] = useState(true);
    const [loading, setLoading] = useState(false);

    // Toggle selection of categories
    const toggleCategorySelection = (category: string) => {
        // Clear error message if there is one
        if (errorMessage.length > 0) {
            setErrorMessage("");
        }
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((item) => item !== category); // Remove from selection
            } else {
                return [...prev, category]; // Add to selection
            }
        });
    };

    // Handle adding book to selected categories and trigger onSuccess with selected categories
    const handleAddBook = async () => {
        console.log("length of selected categories: ", selectedCategories.length);
        if (selectedCategories.length === 0) {
            setErrorMessage("Please select at least one category.");
            return;
        }

        try {
            setLoading(true);
            // Call onConfirm with selected categories and book to add
            if (addOrMoveBook) {
                await onConfirmAddBook(selectedCategories);
            }
            // otherwise will move book instead
            else if (isPossibleToMoveBook) {
                await onConfirmMoveBook(selectedCategories);
            } else {
                console.error("should not happen");
            }
            setSelectedCategories([]); // Reset selections after success
            onClose();
        } catch (error) {
            console.error("Error adding book to categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const AddOrMoveSwitch = () => {
        return (
            <View className="flex-row items-center">
                <Text className="text-black text-lg font-semibold">
                    {addOrMoveBook ? "Add Book To" : "Move Book To"}
                </Text>
                <Switch
                    value={addOrMoveBook}
                    onValueChange={(value) => setAddOrMoveBook(value)}
                />
            </View>
        );
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Backdrop to ensure clicks outside */}
            <Pressable className="flex-1" onPress={onClose}></Pressable>

            <View className="absolute top-12 right-2 bg-white border border-gray-300 rounded-md w-40 p-1">
                <View className="">
                    {/* only render switch if possible to move book otherwise just render add book message*/}
                    {isPossibleToMoveBook ? (
                        AddOrMoveSwitch()
                    ) : (
                        <Text className="text-lg text-black font-semibold">Add Book To</Text>
                    )}
                </View>

                {/* Category Items */}
                <FlatList
                    className="max-h-52"
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => toggleCategorySelection(item)}
                            className="flex-row items-center p-2 border-b border-gray-200 last:border-b-0 space-x-2"
                        >
                            <Checkbox
                                value={selectedCategories.includes(item)} // Ensure the checkbox reflects the selected state
                                onValueChange={() => toggleCategorySelection(item)} // Toggle state properly
                            />
                            <Text className="text-gray-800 text-center">{item}</Text>
                        </Pressable>
                    )}
                />

                {errorMessage.length > 0 && (
                    <Text className="text-red-500 text-center">{errorMessage}</Text>
                )}

                {loading ? <View className="w-full h-10">
                    <LoadingSpinner />
                </View> : <View className="flex-row justify-between mt-2">
                    <Pressable
                        className="p-2 bg-blue-500 rounded-lg"
                        onPress={handleAddBook}
                    >
                        <Text className="text-white">Confirm</Text>
                    </Pressable>
                    <Pressable
                        className="p-2 mr-2 bg-gray-300 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-gray-800">Cancel</Text>
                    </Pressable>
                </View>}

            </View>
        </Modal>
    );
};

export default AddOrMoveSingleBookModal;