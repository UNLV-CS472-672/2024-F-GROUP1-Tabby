import { useRouter } from "expo-router";
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import PinnedIcon from "@/components/categories/PinnedIcon";
import RenameModal from "@/components/categories/RenameModal"; // Import the modal
import DeleteConfirmationModal from '@/components/categories/DeleteConfirmationModal';
import { Category } from '@/types/category';  // Import the Category interface

const Categories = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([
        { name: 'Fiction', isPinned: false, isSelected: false },
        { name: 'Fantasy', isPinned: false, isSelected: false },
        { name: 'Science Fiction', isPinned: false, isSelected: false },
    ]);
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const defaultNewCategoryName = 'New Category';
    const NewCategoryNameRef = useRef(defaultNewCategoryName);


    const sortCategories = (categoryArray: Category[]) => {
        return [...categoryArray].sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    };

    const handleCategoryPress = (category: Category) => {
        // Check if any categories are selected then make category selected instead of going to itspage
        if (areAnyCategoriesSelected()) {
            const updatedCategories = categories.map((currentCategory) => {
                if (currentCategory.name === category.name) { // Assuming category has an id to uniquely identify it
                    return { ...currentCategory, isSelected: !currentCategory.isSelected };
                }
                return currentCategory;
            });

            setCategories(updatedCategories);
            return;
        }
        router.push(`/library/${category.name}`);
    };

    const handlePinPress = (categoryName: string) => {
        const updatedCategories = categories.map((category) =>
            category.name === categoryName
                ? { ...category, isPinned: !category.isPinned }
                : category
        );
        setCategories(sortCategories(updatedCategories));
    };

    const handleLongPress = (categoryName: string) => {
        const updatedCategories = categories.map((category) =>
            category.name === categoryName
                ? { ...category, isSelected: !category.isSelected }
                : category
        );
        setCategories(updatedCategories);
    };

    const handleDelete = () => {
        const remainingCategories = categories.filter(category => !category.isSelected);
        setCategories(sortCategories(remainingCategories));
        setIsDeleteModalVisible(false);
    };

    const handleRename = (newName: string) => {
        // Create a copy of the current categories
        const updatedCategories = [...categories];

        // Loop through each category to rename
        updatedCategories.forEach((category, index) => {
            if (category.isSelected) { // Only modify selected categories
                let uniqueName = newName;
                let counter = 1;

                // Check for uniqueness and append a number if necessary
                while (updatedCategories.some(c => c.name === uniqueName)) {
                    uniqueName = `${newName} (${counter})`;
                    counter++;
                }

                // Update the name in the copied array adn deselect the category since it has been renamed
                updatedCategories[index] = { ...category, name: uniqueName, isSelected: false };
            }
        });

        // Update the state with the modified categories
        setCategories(sortCategories(updatedCategories));
        setIsRenameModalVisible(false); // Close the modal after renaming
    };


    const handleAddCategory = () => {
        // user clicked on plus icon to add new category to many times in a row just return 
        if (isAddingCategory) {
            return
        }
        // will indicate that currently adding new category 
        // and in handleDeletingNewCategoryThatWasNotRenamed will delete the new category if not renamed
        setIsAddingCategory(true);
        let uniqueName = defaultNewCategoryName
        let counter = 1;

        // Check for uniqueness and append a number if necessary
        while (categories.some(currentCategory => currentCategory.name === uniqueName)) {
            uniqueName = `${defaultNewCategoryName} (${counter})`;
            counter++;
        }
        // updating the current category name
        NewCategoryNameRef.current = uniqueName;

        const newCategory = { name: uniqueName, isPinned: false, isSelected: true };
        // updating the categories with newly made cateogry 
        setCategories(sortCategories([...categories, newCategory]));

        // showing modal to rename the selected category based on user input
        setIsRenameModalVisible(true);

    };

    const areAnyCategoriesSelected = () => {
        return categories.some(category => category.isSelected)

    };

    const deselectAllCategories = () => {
        const updatedCategories = categories.map(category => ({ ...category, isSelected: false }));
        setCategories(updatedCategories);
    };


    // will be passed into RenameModal to delete new category if renaming was cancelled
    const handleDeletingNewCategoryThatWasNotRenamed = () => {
        // Filter out any categories that were just added but not renamed if rename was canceled
        if (isAddingCategory) {
            const remainingCategories = categories.filter(
                (category) => category.name !== NewCategoryNameRef.current

            );
            setCategories(sortCategories(remainingCategories));
            setIsAddingCategory(false); // Reset flag
        }

    };

    const handleAddingNewCategoryThatWasNotRenamed = () => {
        // just add new category and do not filter out any categories
        if (isAddingCategory) {
            setIsAddingCategory(false); // Reset flag
            deselectAllCategories();
        }
    }

    const getAllSelectedCategories = () => {
        const allSelectedCategories = categories.filter(category => category.isSelected);
        return allSelectedCategories;

    }

    // this is in vh units to set the height of each category in the FlatList and will only show 7 in view
    const heightOfCategory = 85;
    const maxHeightOfCategories = heightOfCategory * 7;
    return (
        <>
            <SafeAreaView>
                {/* Plus icon to add category cannot add category if there are selected categories */}
                <View className="flex-row justify-end">
                    <Pressable className="p-2" onPress={() => handleAddCategory()}>
                        <FontAwesome name="plus" size={areAnyCategoriesSelected() || isAddingCategory ? 0 : 46} color="white" />
                    </Pressable>
                </View>

                {/* Scrollable FlatList with fixed height */}
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item, index }) => (
                        <View className="">
                            <Pressable
                                onPress={() => handleCategoryPress(item)}
                                onLongPress={() => handleLongPress(item.name)}
                                className={`flex-row items-center justify-between py-4 px-6 
                                ${item.isSelected ? 'bg-blue-500' : (index % 2 === 0 ? 'bg-black' : 'bg-gray-300')} opacity-5`}
                                style={{ opacity: item.isSelected ? 0.7 : 1 }}
                            >
                                <View className="flex-1 items-center">
                                    <Text className={`text-xl font-semibold ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>
                                        {item.name}
                                    </Text>
                                </View>
                                <Pressable className="p-1" disabled={areAnyCategoriesSelected()} onPress={() => handlePinPress(item.name)}>
                                    <PinnedIcon isPinned={item.isPinned} />
                                </Pressable>
                            </Pressable>
                        </View>
                    )}
                    style={{ maxHeight: maxHeightOfCategories }}
                />


            </SafeAreaView>

            {/* Rename/Delete options hidden but shown when a category is selected */}
            {categories.some(category => category.isSelected) && (
                <View className="absolute bottom-16 w-full p-4 bg-blue-900 flex-row justify-evenly">
                    <Pressable onPress={() => setIsDeleteModalVisible(true)} className="mb-4">
                        <Text className="text-white text-center">Delete</Text>
                    </Pressable>
                    <Pressable onPress={() => setIsRenameModalVisible(true)}>
                        <Text className="text-white text-center">Rename</Text>
                    </Pressable>
                    <Pressable onPress={() => deselectAllCategories()}>
                        <Text className="text-white text-center">Cancel</Text>
                    </Pressable>
                </View>
            )}

            {/* Rename Modal hidden at start but opens when the rename button is clicked */}
            {isRenameModalVisible && (
                <RenameModal
                    categoriesBeingRenamed={getAllSelectedCategories()}
                    onRename={handleRename}
                    onCancel={() => setIsRenameModalVisible(false)}
                    deleteNewCategoryIfNotRenamedOnCancel={handleDeletingNewCategoryThatWasNotRenamed}
                    addNewCategoryIfNotRenamedOnOk={handleAddingNewCategoryThatWasNotRenamed}
                    resetIsAddingCategory={() => setIsAddingCategory(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalVisible && (
                <DeleteConfirmationModal
                    onConfirm={handleDelete}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    selectedCategories={getAllSelectedCategories()} // Pass selected categories
                />
            )}
        </>

    );
};

export default Categories;
