import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface DropdownMenuProps {
    visible: boolean;
    items: string[];
    onSelect: (item: string) => void;
    onClose: () => void;
    heading?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ visible, items, onSelect, onClose, heading = "Categories" }) => {
    if (!visible) return null;

    return (
        <>
            {/* need to use absolute position  to position the dropdown menu below the button */}
            <View className="absolute top-12 right-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {/* Header */}
                <Text className="text-gray-600 font-bold p-2 border-b border-gray-200 text-center">{heading}</Text>

                {/* Category Items */}
                {items.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            onSelect(item);
                            onClose(); // Close the dropdown after selection
                        }}
                        className="p-2 border-b border-gray-200 last:border-b-0"
                    >
                        <Text className="text-gray-800 text-center">{item}</Text>
                    </Pressable>
                ))}

                {/* Cancel Button */}
                <Pressable onPress={onClose} className="p-2 border-t border-gray-200">
                    <Text className="text-center text-red-500 font-semibold">Cancel</Text>
                </Pressable>
            </View>

        </>


    );
};

export default DropdownMenu;
