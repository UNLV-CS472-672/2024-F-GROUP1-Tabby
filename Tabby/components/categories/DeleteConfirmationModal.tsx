import React from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { Category } from "@/types/category";

interface DeleteConfirmationModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    selectedCategories: Category[];
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onConfirm, onCancel, selectedCategories }) => {
    const onlySingleItemSelectedToDelete = selectedCategories.length === 1; // Check if there is only one item selected to delete

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


                    {/* Confirm and cancel buttons */}
                    <View className="flex-row justify-between mt-5">
                        <Pressable onPress={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
                            <Text>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            className={`px-4 py-2 bg-red-500 rounded-md`}
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
