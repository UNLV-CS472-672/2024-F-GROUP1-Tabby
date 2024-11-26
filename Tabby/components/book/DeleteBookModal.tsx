import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import React from 'react';

interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-center items-center">
                    <TouchableWithoutFeedback>
                        <View className="w-4/5 bg-white rounded-lg p-5">
                            <Text className="text-lg font-bold text-center mb-4">Delete Book</Text>
                            <Text className="text-center mb-6">
                                Are you sure you want to delete this book? This action cannot be undone.
                            </Text>
                            <View className="flex-row justify-around">
                                <Pressable
                                    onPress={onConfirm}
                                    className="bg-red-500 px-4 py-2 rounded-md"
                                >
                                    <Text className="text-center text-white">Delete</Text>
                                </Pressable>
                                <Pressable
                                    onPress={onClose}
                                    className="bg-gray-300 px-4 py-2 rounded-md"
                                >
                                    <Text className="text-center text-black">Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default DeleteModal;
