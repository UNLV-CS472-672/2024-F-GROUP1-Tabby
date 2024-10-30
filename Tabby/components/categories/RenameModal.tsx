import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { Category } from "@/types/category";

interface RenameModalProps {
    categoriesBeingRenamed: Category[];
    onRename: (newName: string) => void;
    onCancel: () => void;
    deleteNewCategoryIfNotRenamedOnCancel: () => void;
    addNewCategoryIfNotRenamedOnOk: () => void;
    resetIsAddingCategory: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
    categoriesBeingRenamed,
    onRename,
    onCancel,
    deleteNewCategoryIfNotRenamedOnCancel,
    addNewCategoryIfNotRenamedOnOk,
    resetIsAddingCategory }) => {
    const [newName, setNewName] = useState(
        (categoriesBeingRenamed.length > 1 ? '' : categoriesBeingRenamed[0].name) as string);
    const [errorMessage, setErrorMessage] = useState(null as string | null);

    const handleConfirm = () => {
        setErrorMessage(null);
        const trimmedName = newName.trim();

        // will add new category that was not renamed beacuse user pressd ok 
        addNewCategoryIfNotRenamedOnOk()


        // name did not change from initial name
        if (trimmedName === categoriesBeingRenamed[0].name) {
            onCancel()
            return
        }



        if (trimmedName === "") {
            setErrorMessage("Category name cannot be empty.");
            setNewName('');

            return;
        }
        onRename(trimmedName);
        setNewName('');
        // reset is setting category flag to false
        resetIsAddingCategory();
    };


    const handleCancel = () => {
        setNewName('');
        // if adding a new category then delete if renaming of it was cancelled
        deleteNewCategoryIfNotRenamedOnCancel()
        // reset is setting addding category flag to false
        resetIsAddingCategory()

        onCancel();
    }

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
