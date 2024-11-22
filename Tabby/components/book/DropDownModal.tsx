import React from 'react';
import { View, Text, Pressable, FlatList, Modal } from 'react-native';

interface DropdownModalProps {
    visible: boolean;
    items: string[];
    onSelect: (item: string) => void;
    onClose: () => void;
    heading?: string;
}

const DropdownModal: React.FC<DropdownModalProps> = ({ visible, items, onSelect, onClose, heading = "Categories" }) => {
    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose} // Close the modal on back press (Android)
        >
            {/* Backdrop */}
            <Pressable
                className="flex-1"
                onPress={onClose} // Close the modal when clicking outside
            >
                {/* Empty Pressable ensures clicks outside are registered */}
            </Pressable>

            {/* Dropdown Content */}
            <View className="absolute top-12 right-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {/* Header */}
                <Text className="text-gray-600 font-bold p-2 border-b border-gray-200 text-center">
                    {heading}
                </Text>

                {/* Category Items */}
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                onSelect(item);
                                onClose(); // Close the dropdown after selection
                            }}
                            className="p-2 border-b border-gray-200 last:border-b-0"
                        >
                            <Text className="text-gray-800 text-center">{item}</Text>
                        </Pressable>
                    )}
                />

                {/* Cancel Button */}
                <Pressable onPress={onClose} className="p-2 border-t border-gray-200">
                    <Text className="text-center text-red-500 font-semibold">Cancel</Text>
                </Pressable>
            </View>
        </Modal>
    );
};

export default DropdownModal;
