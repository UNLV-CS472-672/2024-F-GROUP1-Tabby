import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { Category } from "@/types/category";
import LoadingSpinner from '@/components/LoadingSpinner';

interface DeleteConfirmationModalProps {
    onConfirm: () => Promise<string>; // onConfirm is now async
    onCancel: () => void;
    selectedCategories: Category[];
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onConfirm, onCancel, selectedCategories }) => {
    const onlySingleItemSelectedToDelete = selectedCategories.length === 1;
    const [errorMessage, setErrorMessage] = useState(null as string | null);
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={onCancel}
        >
            <Pressable
                className="flex-1"
                onPress={onCancel} // Close the modal when pressing outside the content
            >

            </Pressable>

            <View
                className="mx-auto w-80 p-5 bg-white rounded-md z-10"
            >
                <Text className="text-lg font-bold mb-4 text-center">
                    {onlySingleItemSelectedToDelete
                        ? "Are you sure you want to delete this category?"
                        : "Are you sure you want to delete the selected categories?"}
                </Text>
                <FlatList
                    className='max-h-52'
                    data={selectedCategories}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <Text className="text-center mb-2"> {item.name}</Text>
                    )}
                    showsVerticalScrollIndicator={true}
                />

                {errorMessage && (
                    <Text className="text-red-500 text-center">{errorMessage}</Text>
                )}

                {loading ? <View className='w-full h-10'>
                    <LoadingSpinner />

                </View> : <View className="flex-row justify-between mt-5">
                    <Pressable
                        onPress={handleConfirm}
                        className="px-4 py-2 bg-red-500 rounded-md"
                    >
                        <Text className="text-white">Delete</Text>
                    </Pressable>
                    <Pressable
                        onPress={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded-md"
                    >
                        <Text>Cancel</Text>
                    </Pressable>
                </View>}




            </View>
            <Pressable
                className="flex-1"
                onPress={onCancel} // Close the modal when pressing outside the content
            >
            </Pressable>
        </Modal>
    );
};


export default DeleteConfirmationModal;
