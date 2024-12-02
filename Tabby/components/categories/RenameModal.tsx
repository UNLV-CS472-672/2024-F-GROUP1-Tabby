import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, ScrollView } from 'react-native';
import { Category } from "@/types/category";
import LoadingSpinner from '@/components/LoadingSpinner';

interface RenameModalProps {
    categoriesBeingRenamed: Category[];
    onRename: (newName: string) => Promise<void>; // Now returns a Promise<void>
    onCancel: () => void;
    deleteNewCategoryOnCancel: () => void;
    isAddingNewCategory: boolean;
    handleDeselectingNewCategory: () => void;
}


const RenameModal: React.FC<RenameModalProps> = ({
    categoriesBeingRenamed,
    onRename,
    onCancel,
    deleteNewCategoryOnCancel,
    isAddingNewCategory,
    handleDeselectingNewCategory }) => {
    // if new category is being added then set initial name to empty or if there is more than one category being renamed
    // otherwise set the initial name to the category name being renamed
    const [newName, setNewName] = useState<string>(
        categoriesBeingRenamed.length > 1 || isAddingNewCategory
            ? ''
            : categoriesBeingRenamed[0]?.name || '' // Using optional chaining and defaulting to an empty string
    );
    const [errorMessage, setErrorMessage] = useState(null as string | null);
    const [loading, setLoading] = useState(false);
    const maxLength = 100;

    const handleConfirm = async () => {
        setErrorMessage(null);
        const trimmedName = newName.trim();

        if (trimmedName === "") {
            setErrorMessage("Category name cannot be empty.");
            setNewName('');
            return;
        }

        if (trimmedName.length > maxLength) {
            setErrorMessage(`Category name cannot be longer than ${maxLength} characters.`);
            setNewName('');
            return;
        }

        if (isAddingNewCategory) {
            handleDeselectingNewCategory();
        }

        if (trimmedName === categoriesBeingRenamed[0].name && !isAddingNewCategory) {
            console.log("Category name is the same as before.: ", trimmedName);
            onCancel();
            return;
        }

        try {
            setLoading(true);
            await onRename(trimmedName); // Await the async onRename function
            setNewName('');
        } catch (error) {
            setErrorMessage("Error renaming category.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const handleCancel = () => {
        setNewName('');
        // if adding a new category then delete if renaming of it was cancelled
        if (isAddingNewCategory) {
            deleteNewCategoryOnCancel();
        }

        onCancel();
    }

    // used to reset the error message if user starts typing stuff and then also set local state of the new name
    const handleChangeText = (text: string) => {
        setErrorMessage(null);
        setNewName(text);
    }

    // rename label changes based if renaming more than one category
    const renameLabel = categoriesBeingRenamed.length > 1 ? "Rename Categories" : "Rename Category";

    return (
        <Modal
            transparent={true}
            animationType="slide"
            onRequestClose={handleCancel}
        >
            {/* Backdrop */}
            <Pressable
                className="flex-1"
                onPress={handleCancel} // Close the modal when clicking outside
            >
                {/* Empty Pressable ensures clicks outside are registered */}
            </Pressable>

            <View
                className="mx-auto bg-white p-4 rounded w-80 z-10"            >
                <Text className="text-lg font-semibold mb-2">
                    {isAddingNewCategory ? "Add New Category" : renameLabel}
                </Text>

                <View>

                    <FlatList
                        className='max-h-52'
                        data={categoriesBeingRenamed}
                        renderItem={({ item }) => (
                            <Text className="mb-2">{categoriesBeingRenamed.length > 1 ? "• " : ""} {item.name}</Text>
                        )}
                        keyExtractor={(item) => item.name}
                    />

                </View>

                <ScrollView className='max-h-16'>
                    <TextInput
                        value={newName}
                        onChangeText={handleChangeText}
                        placeholder="Enter new category name"
                        className="border p-2 mb-4"
                        autoFocus={true}
                        multiline={true}
                    />
                </ScrollView>


                {errorMessage && (
                    <Text className="text-red-500 mb-2">{errorMessage}</Text>
                )}

                {loading ? <View className='w-full h-10'>
                    <LoadingSpinner />
                </View> : <View className="flex-row justify-between">
                    <Pressable onPress={handleConfirm} className="bg-blue-500 px-4 p-2 rounded-md">
                        <Text className="text-white">OK</Text>
                    </Pressable>
                    <Pressable onPress={handleCancel} className="px-4 py-2 bg-gray-300 rounded-md">
                        <Text className="text-black">Cancel</Text>
                    </Pressable>
                </View>}




            </View>
            <Pressable
                className="flex-1"
                onPress={handleCancel} // Close the modal when pressing outside the content
            >

            </Pressable>
        </Modal>
    );
};

export default RenameModal;
