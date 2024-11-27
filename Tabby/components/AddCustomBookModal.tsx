import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Pressable,
    Text,
    TextInput,
    View,
    Platform,
    Modal,
} from "react-native";

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
    handleAddCustomBook: () => Promise<void>;
}

const AddCustomBookModal: React.FC<AddCustomBookModalProps> = ({
    modalVisible,
    setModalVisible,
    newCustomBook,
    setNewCustomBook,
    handleAddCustomBook,
}) => {
    const [errors, setErrors] = useState<Record<keyof typeof newCustomBook, string | null>>({
        title: null,
        author: null,
        summary: null,
        excerpt: null,
        notes: null,
        pageCount: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fields: {
        key: keyof typeof newCustomBook;
        label: string;
        placeholder: string;
        multiline?: boolean;
        height?: number;
        keyboardType?: string;
    }[] = [
            { key: "title", label: "Add Title", placeholder: "Title" },
            { key: "author", label: "Add Author", placeholder: "Author" },
            { key: "summary", label: "Add Summary", placeholder: "Summary", multiline: true, height: 80 },
            { key: "excerpt", label: "Add Excerpt", placeholder: "Excerpt" },
            { key: "notes", label: "Add Notes", placeholder: "Notes", multiline: true, height: 80 },
            { key: "pageCount", label: "Add Page Count", placeholder: "Page Count", keyboardType: "numeric" },
        ];

    const validateFields = () => {
        const newErrors: Record<keyof typeof newCustomBook, string | null> = {
            title: newCustomBook.title.trim() ? null : "Title is required.",
            author: newCustomBook.author.trim() ? null : "Author is required.",
            summary: newCustomBook.summary.trim() ? null : "Summary is required.",
            excerpt: newCustomBook.excerpt.trim() ? null : "Excerpt is required.",
            notes: newCustomBook.notes.trim() ? null : "Notes are required.",
            pageCount:
                newCustomBook.pageCount !== null && !isNaN(newCustomBook.pageCount)
                    ? null
                    : "Page count must be a valid number.",
        };

        setErrors(newErrors);
        // Check if any field has an error
        return Object.values(newErrors).every((error) => error === null);
    };

    const handleConfirm = async () => {
        if (!validateFields()) return;

        setIsSubmitting(true);
        try {
            await handleAddCustomBook();
            setModalVisible(false);
        } catch (err) {
            console.error(err);
            // Handle the general error here
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = ({
        item,
    }: {
        item: {
            key: keyof typeof newCustomBook;
            label: string;
            placeholder: string;
            multiline?: boolean;
            height?: number;
            keyboardType?: string;
        };
    }) => (
        <View className="mb-4">
            <Text className="text-lg font-medium">{item.label}</Text>
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
                    // Clear error for the field
                    setErrors((prev) => ({ ...prev, [item.key]: null }));
                }}
                multiline={item.multiline || false}
                textAlignVertical={item.multiline ? "top" : "center"}
                keyboardType={item.keyboardType as
                    | "default"
                    | "numeric"
                    | "email-address"
                    | "phone-pad"
                    | "url"
                    | "decimal-pad"
                    | "ascii-capable"
                    | undefined}
                className={`border-b border-gray-300 ${item.height ? `h-${item.height}` : ""}`}
            />
            {errors[item.key] && (
                <Text className="text-red-500 text-sm">{errors[item.key]}</Text>
            )}
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center items-center"
            >
                <View className="w-4/5 p-6 bg-white rounded-lg">
                    <FlatList
                        data={fields}
                        renderItem={renderField}
                        keyExtractor={(item) => item.key}
                        className="max-h-64"
                    />
                    <Pressable
                        className={`mt-4 rounded p-2 ${isSubmitting ? "bg-gray-400" : "bg-blue-500"}`}
                        onPress={handleConfirm}
                        disabled={isSubmitting}
                    >
                        <Text className="text-white text-center">
                            {isSubmitting ? "Submitting..." : "Confirm"}
                        </Text>
                    </Pressable>
                    <Pressable
                        className="mt-4 bg-red-500 rounded p-2"
                        onPress={() => setModalVisible(false)}
                    >
                        <Text className="text-white text-center">Cancel</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
            <Pressable className="flex-1" onPress={() => setModalVisible(false)}>

            </Pressable>
        </Modal>
    );
};

export default AddCustomBookModal;
