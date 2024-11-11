import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { Category } from "@/types/category";

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

    const handleConfirm = async () => {
        setErrorMessage(null);
        const trimmedName = newName.trim();

        if (trimmedName === "") {
            setErrorMessage("Category name cannot be empty.");
            setNewName('');
            return;
        }

        if (isAddingNewCategory) {
            handleDeselectingNewCategory();
        }

        if (trimmedName === categoriesBeingRenamed[0].name) {
            onCancel();
            return;
        }

        try {
            await onRename(trimmedName); // Await the async onRename function
            setNewName('');
        } catch (error) {
            setErrorMessage("Error renaming category.");
            console.error(error);
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

    return (
        <Modal
            transparent={true}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View className="flex-1 justify-center items-center bg-transparent bg-opacity-50">
                <View className="bg-white p-4 rounded w-80">
                    <Text className="text-lg font-semibold mb-2"> {categoriesBeingRenamed.length > 1 ? "Rename Categories:" : "Rename Category"} </Text>
                    {categoriesBeingRenamed.length > 1 && (<View className='flex-col'>
                        {categoriesBeingRenamed.map((category) => (

                            <Text key={category.name} className="mb-2">
                                {category.name}
                            </Text>
                        ))}
                    </View>)
                    }

                    <TextInput
                        value={newName}
                        onChangeText={handleChangeText}
                        placeholder="Enter new category name"
                        className="border p-2 mb-4"
                    />
                    {errorMessage && (
                        <Text className="text-red-500 mb-2">{errorMessage}</Text>
                    )}
                    <View className="flex-row justify-between">
                        <Pressable onPress={handleConfirm} className="bg-blue-500 p-2 rounded">
                            <Text className="text-white">OK</Text>
                        </Pressable>
                        <Pressable onPress={handleCancel} className="bg-gray-400 p-2 rounded">
                            <Text className="text-white">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default RenameModal;
