import React from "react";
import { FlatList, KeyboardAvoidingView, Pressable, Text, TextInput, View, Platform, TouchableWithoutFeedback, Keyboard, Modal } from "react-native";

interface AddCustomBookModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    newCustomBook: {
        title: string;
        author: string;
        summary: string;
        excerpt: string;
        notes: string;
        pageCount: number | null;
    };
    setNewCustomBook: (book: {
        title: string;
        author: string;
        summary: string;
        excerpt: string;
        notes: string;
        pageCount: number | null;
    }) => void;
    handleAddCustomBook: () => void;
}

const AddCustomBookModal: React.FC<AddCustomBookModalProps> = ({
    modalVisible,
    setModalVisible,
    newCustomBook,
    setNewCustomBook,
    handleAddCustomBook
}) => {
    // Fields array with 'key' typed to the valid keys of newCustomBook
    const fields: { key: keyof typeof newCustomBook; label: string; placeholder: string; multiline?: boolean; height?: number; keyboardType?: string }[] = [
        { key: "title", label: "Add Title", placeholder: "Title" },
        { key: "author", label: "Add Author", placeholder: "Author" },
        { key: "summary", label: "Add Summary", placeholder: "Summary", multiline: true, height: 80 },
        { key: "excerpt", label: "Add Excerpt", placeholder: "Excerpt" },
        { key: "notes", label: "Add Notes", placeholder: "Notes", multiline: true, height: 80 },
        { key: "pageCount", label: "Add Page Count", placeholder: "Page Count", keyboardType: "numeric" },
    ];

    const renderField = ({ item }: { item: { key: keyof typeof newCustomBook; label: string; placeholder: string; multiline?: boolean; height?: number; keyboardType?: string } }) => (
        <View>
            <Text className="text-lg font-medium mb-2">{item.label}</Text>
            <TextInput
                placeholder={item.placeholder}
                value={
                    item.key === "pageCount"
                        ? newCustomBook[item.key]?.toString() || ""
                        : newCustomBook[item.key]
                }
                onChangeText={(text) => {
                    const value =
                        item.key === "pageCount"
                            ? text.replace(/[^0-9]/g, "")
                            : text;
                    setNewCustomBook({
                        ...newCustomBook,
                        [item.key]: item.key === "pageCount" && value ? parseInt(value, 10) : value,
                    });
                }}
                multiline={item.multiline || false}
                textAlignVertical={item.multiline ? "top" : "center"}
                keyboardType={item.keyboardType as "default" | "numeric" | "email-address" | "phone-pad" | "url" | "decimal-pad" | "ascii-capable" | undefined}
                className={`border-b border-gray-300 mb-2 ${item.height ? `h-${item.height}` : ""}`}
            />
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <Pressable className="flex-1" onPress={() => setModalVisible(false)}>

            </Pressable>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 justify-center items-center"
                >
                    <View className="w-4/5 p-6 bg-white rounded-lg">
                        <FlatList
                            data={fields}
                            renderItem={renderField}
                            keyExtractor={(item) => item.key}
                            className="max-h-72"
                        />
                        <Pressable
                            className="mt-4 bg-blue-500 rounded p-2"
                            onPress={handleAddCustomBook}
                        >
                            <Text className="text-white text-center">Confirm</Text>
                        </Pressable>
                        <Pressable
                            className="mt-4 bg-red-500 rounded p-2"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white text-center">Cancel</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            <Pressable className="flex-1" onPress={() => setModalVisible(false)}>

            </Pressable>
        </Modal>
    );
};

export default AddCustomBookModal;
