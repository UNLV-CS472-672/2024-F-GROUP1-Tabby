import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, FlatList, Text, View, Switch } from 'react-native';
import {
    addCategory, deleteCategory, updateCategory, getCategoryByName,
    getAllCategories
} from '@/database/databaseOperations';
import { Category } from '@/types/category';
import { useSQLiteContext } from 'expo-sqlite';

const TestCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [inputValues, setInputValues] = useState<Partial<Category>>({});
    const [oldName, setOldName] = useState(''); // Separate state for old name
    const db = useSQLiteContext();

    const fetchCategories = async () => {
        const categories = await getAllCategories();
        console.log(categories);
        setCategories(categories as Category[] || []);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openModal = (type: string) => {
        setModalType(type);
        setModalVisible(true);
        setInputValues({});
        setOldName(''); // Reset oldName when opening modal
    };

    const closeModal = () => setModalVisible(false);

    const handleInputChange = (key: keyof Category, value: string | boolean) => {
        setInputValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleOldNameChange = (value: string) => {
        setOldName(value); // Update oldName separately
    };

    const handleAction = async () => {
        const categoryData = inputValues as Category;

        switch (modalType) {
            case 'addCategory':
                await addCategory(categoryData);
                break;
            case 'deleteCategory':
                await deleteCategory(categoryData.name as string);
                break;
            case 'updateCategory':
                // Pass oldName separately to the updateCategory function
                await updateCategory(oldName, categoryData);
                break;
            case 'getCategoryByName':
                const category = await getCategoryByName(categoryData.name as string);
                alert(JSON.stringify(category));
                break;
        }

        await fetchCategories();
        closeModal();
    };

    const resetCategoriesTable = async () => {
        try {
            await db.runAsync('DELETE FROM categories');
            setCategories([]);
            alert('Categories table has been reset.');
        } catch (error) {
            console.error("Error resetting Categories table:", error);
            alert("Failed to reset Categories table.");
        }
    };

    return (
        <View>
            <Text className="font-bold text-lg mb-2">Categories:</Text>
            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View className="mr-4 p-2 bg-gray-100 rounded-lg">
                        <Text className="text-sm text-gray-700">
                            {JSON.stringify(item, null, 2)}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
            <Button title="Add Category" onPress={() => openModal('addCategory')} />
            <Button title="Delete Category" onPress={() => openModal('deleteCategory')} />
            <Button title="Update Category" onPress={() => openModal('updateCategory')} />
            <Button title="Get Category by Name" onPress={() => openModal('getCategoryByName')} />
            <Button title="Reset Categories" onPress={resetCategoriesTable} color="#FF5252" />

            <Modal visible={modalVisible} transparent>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="w-72 p-5 bg-white rounded-lg">
                        <Text className="font-bold text-base mb-3">Enter Values</Text>
                        {/* Input for old name only if the action is "updateCategory" */}
                        {modalType === 'updateCategory' && (
                            <TextInput
                                placeholder="Old Name"
                                value={oldName}
                                onChangeText={handleOldNameChange} // Use separate handler
                                className="border-b border-gray-300 mb-3 p-2"
                            />
                        )}
                        {[
                            'name', 'position'
                        ].map((key) => (
                            <TextInput
                                key={key}
                                placeholder={key}
                                value={inputValues[key as keyof Category]?.toString() || ''}
                                onChangeText={(value) => handleInputChange(key as keyof Category, value)}
                                className="border-b border-gray-300 mb-3 p-2"
                            />
                        ))}
                        {/* Switch for the pinned field */}
                        <View className="flex-row items-center mb-3">
                            <Text>Pinned:</Text>
                            <Switch
                                value={Boolean(inputValues.isPinned)}
                                onValueChange={(value) => handleInputChange('isPinned', value)}
                            />
                        </View>
                        <Button title="Submit" onPress={handleAction} />
                        <Button title="Cancel" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TestCategories;
