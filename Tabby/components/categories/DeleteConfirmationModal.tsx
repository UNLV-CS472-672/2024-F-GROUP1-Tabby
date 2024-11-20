import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { Category } from "@/types/category";

interface DeleteConfirmationModalProps {
    onConfirm: () => Promise<string>; // onConfirm is now async
    onCancel: () => void;
    selectedCategories: Category[];
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onConfirm, onCancel, selectedCategories }) => {
    const onlySingleItemSelectedToDelete = selectedCategories.length === 1;
    const [errorMessage, setErrorMessage] = useState(null as string | null);
    const handleConfirm = async () => {
        try {
            const result = await onConfirm(); // Await the async onConfirm function
            if (result === "Cannot delete all categories") {
                setErrorMessage("Cannot delete all categories");
            } else if (result === "Error occurred while deleting categories") {
                setErrorMessage("Error occurred while deleting categories");
            }
        } catch (error) {
            console.error("Error deleting categories:", error);
            // Optionally, you could show an error message here if needed
            setErrorMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View className="flex-1 justify-center items-center bg-transparent bg-opacity-50">
                <View className="w-80 p-5 bg-white rounded-md">
                    <Text className="text-lg font-bold mb-4 text-center">
                        {onlySingleItemSelectedToDelete
                            ? "Are you sure you want to delete this item?"
                            : "Are you sure you want to delete the selected items?"}
                    </Text>
                    <FlatList
                        data={selectedCategories}
                        keyExtractor={(item) => item.name}
                        renderItem={({ item }) => (
                            <Text className="text-center mb-2">{item.name}</Text>
                        )}
                    />

                    {errorMessage && <Text className="text-red-500 text-center">{errorMessage}</Text>}
                    <View className="flex-row justify-between mt-5">
                        <Pressable onPress={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
                            <Text>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleConfirm}
                            className="px-4 py-2 bg-red-500 rounded-md"
                        >
                            <Text className="text-white">Delete</Text>
                        </Pressable>

                    </View>
                </View>
            </View>
        </Modal>
    );
};


export default DeleteConfirmationModal;
