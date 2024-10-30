import { useRouter } from "expo-router";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useState, useRef } from "react";
import PinnedIcon from "@/components/categories/PinnedIcon";
import RenameModal from "@/components/categories/RenameModal"; // Import the modal
import DeleteConfirmationModal from "@/components/categories/DeleteConfirmationModal";
import { Category } from "@/types/category"; // Import the Category interface
import SelectedMenu from "@/components/categories/SelectedMenu";
import BarsIcon from "@/components/categories/BarsIcon"

const Categories = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([
    { name: "Fiction", isPinned: false, isSelected: false, position: 0 },
    { name: "Fantasy", isPinned: false, isSelected: false, position: 0 },
    { name: "Science Fiction", isPinned: false, isSelected: false, position: 0 },
  ]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const defaultNewCategoryName = "New Category";
  const NewCategoryNameRef = useRef(defaultNewCategoryName);

  const sortCategories = (categoryArray: Category[]) => {
    return [...categoryArray].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  // can go to specific book category page or just make category selected if any other categories are selected 
  const handleCategoryPress = (category: Category) => {
    // Check if any categories are selected then make category selected instead of going to its page
    if (areAnyCategoriesSelected()) {
      const updatedCategories = categories.map((currentCategory) => {
        if (currentCategory.name === category.name) {
          // Assuming category has an id to uniquely identify it
          return {
            ...currentCategory,
            isSelected: !currentCategory.isSelected,
          };
        }
        return currentCategory;
      });

      setCategories(updatedCategories);
      return;
    }
    router.push(`/library/${category.name}`);
  };

  // will pin or unpin a category
  const handlePinPress = (categoryName: string) => {
    const updatedCategories = categories.map((category) =>
      category.name === categoryName
        ? { ...category, isPinned: !category.isPinned }
        : category
    );
    setCategories(sortCategories(updatedCategories));
  };

  // will select or unselect a category by doing a long press
  const handleLongPress = (categoryName: string) => {
    const updatedCategories = categories.map((category) =>
      category.name === categoryName
        ? { ...category, isSelected: !category.isSelected }
        : category
    );
    setCategories(updatedCategories);
  };

  // will delete all selected categories
  const handleDelete = () => {
    const remainingCategories = categories.filter(
      (category) => !category.isSelected
    );
    setCategories(sortCategories(remainingCategories));
    setIsDeleteModalVisible(false);
  };

  // will be passed into RenameModal to handle renaming a category 
  const handleRename = (newName: string) => {
    // Create a copy of the current categories
    const updatedCategories = [...categories];

    // Loop through each category to rename
    updatedCategories.forEach((category, index) => {
      if (category.isSelected) {
        // Only modify selected categories
        let uniqueName = newName;
        let counter = 1;

        // Check for uniqueness and append a number if necessary
        while (updatedCategories.some((c) => c.name === uniqueName)) {
          uniqueName = `${newName} (${counter})`;
          counter++;
        }

        // Update the name in the copied array and deselect the category since it has been renamed
        updatedCategories[index] = {
          ...category,
          name: uniqueName,
          isSelected: false,
        };
      }
    });

    // Update the state with the modified categories
    setCategories(sortCategories(updatedCategories));
    setIsRenameModalVisible(false); // Close the modal after renaming
  };

  const handleAddCategory = () => {
    // user clicked on plus icon to add new category to many times in a row just return
    if (isAddingCategory) {
      return;
    }
    // will indicate that currently adding new category
    // and in handleDeletingNewCategoryThatWasNotRenamed will delete the new category if not renamed
    setIsAddingCategory(true);
    let uniqueName = defaultNewCategoryName;
    let counter = 1;

    // Check for uniqueness and append a number if necessary
    while (
      categories.some((currentCategory) => currentCategory.name === uniqueName)
    ) {
      uniqueName = `${defaultNewCategoryName} (${counter})`;
      counter++;
    }
    // updating the current category name
    NewCategoryNameRef.current = uniqueName;

    const newCategory = { name: uniqueName, isPinned: false, isSelected: true, position: 0 };
    // updating the categories with newly made cateogry
    setCategories(sortCategories([...categories, newCategory]));

    // showing modal to rename the selected category based on user input
    setIsRenameModalVisible(true);
  };

  // to check if any category is selected
  const areAnyCategoriesSelected = () => {
    return categories.some((category) => category.isSelected);
  };

  // to deselect all categories
  const deselectAllCategories = () => {
    const updatedCategories = categories.map((category) => ({
      ...category,
      isSelected: false,
    }));
    setCategories(updatedCategories);
  };

  // will be passed into RenameModal to delete new category if renaming was cancelled
  const handleDeletingNewCategoryInRenameModal = () => {
    // Filter out any categories that were just added but not renamed if rename was canceled
    if (isAddingCategory) {
      const remainingCategories = categories.filter(
        (category) => category.name !== NewCategoryNameRef.current
      );
      setCategories(sortCategories(remainingCategories));
      setIsAddingCategory(false); // Reset flag
    }
  };

  // will be passed into RenameModal to deselect the newly added category
  const handleDeselectingNewCategory = () => {

    if (isAddingCategory) {
      setIsAddingCategory(false); // Reset flag
      deselectAllCategories();
    }
  };

  // will return all selected categories
  const getAllSelectedCategories = () => {
    const allSelectedCategories = categories.filter(
      (category) => category.isSelected
    );
    return allSelectedCategories;
  };


  return (
    <>


      <SafeAreaView className="flex-1">



        {/* Top row for add category icon */}
        <View className="flex-row justify-end p-2">
          <Pressable onPress={() => handleAddCategory()}>
            <FontAwesome
              name="plus"
              size={areAnyCategoriesSelected() || isAddingCategory ? 0 : 46}
              color="white"
            />
          </Pressable>
        </View>

        {/* Content area to allow FlatList and menu to stack correctly */}
        <View className="flex-1">
          {/* Scrollable FlatList */}
          <FlatList
            data={categories}
            keyExtractor={(item) => item.name}
            renderItem={({ item, index }) => (
              <View>
                <Pressable
                  onPress={() => handleCategoryPress(item)}
                  onLongPress={() => handleLongPress(item.name)}
                  className={`flex-row items-center justify-between py-4 px-6 
                          ${item.isSelected ? "bg-blue-500" : index % 2 === 0 ? "bg-black" : "bg-gray-300"}`}
                >
                  <Pressable disabled={areAnyCategoriesSelected()}>
                    <BarsIcon height={30} width={30} color={index % 2 === 0 ? "white" : "black"} />
                  </Pressable>

                  <View className="items-center flex-1">
                    <Text className={`text-xl font-semibold ${index % 2 === 0 ? "text-white" : "text-black"}`}>
                      {item.name}
                    </Text>
                  </View>
                  <Pressable
                    className="p-1"
                    disabled={areAnyCategoriesSelected()}
                    onPress={() => handlePinPress(item.name)}
                  >
                    <PinnedIcon isPinned={item.isPinned} />
                  </Pressable>
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Bottom menu: shown when categories are selected */}
        {categories.some((category) => category.isSelected) && (


          <SelectedMenu openDeleteModal={() => setIsDeleteModalVisible(true)} openRenameModal={() => setIsRenameModalVisible(true)} openCancelModal={() => deselectAllCategories()} />
        )}
      </SafeAreaView>

      {/* Rename Modal */}
      {isRenameModalVisible && (
        <RenameModal
          categoriesBeingRenamed={getAllSelectedCategories()}
          onRename={handleRename}
          onCancel={() => setIsRenameModalVisible(false)}
          deleteNewCategoryOnCancel={handleDeletingNewCategoryInRenameModal}
          isAddingNewCategory={isAddingCategory}
          handleDeselectingNewCategory={handleDeselectingNewCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalVisible && (
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          selectedCategories={getAllSelectedCategories()}
        />
      )}
    </>

  );
};

export default Categories;
