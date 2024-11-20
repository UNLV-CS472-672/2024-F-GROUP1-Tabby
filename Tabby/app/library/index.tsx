import { useRouter } from "expo-router";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import PinnedIcon from "@/components/categories/PinnedIcon";
import RenameModal from "@/components/categories/RenameModal";
import DeleteConfirmationModal from "@/components/categories/DeleteConfirmationModal";
import { Category } from "@/types/category";
import { SearchBar } from "@rneui/themed";
import { useEffect } from "react";
import SelectedMenu from "@/components/categories/SelectedMenu";
import { getAllCategories, addCategory, deleteCategory, updateCategory, getAllUserBooksByCategory, updateMultipleUserBooksCategory, deleteAllUserBooksByCategory } from "@/database/databaseOperations";
import PlusIcon from "@/assets/categories/plus-icon.svg";

const Categories = () => {
  const router = useRouter();
  // Initialize state with an empty array if initialCategories is null or undefined
  const [categories, setCategories] = useState<Category[]>([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [search, setSearch] = useState("");
  const defaultNewCategoryName = "New Category";
  const NewCategoryNameRef = useRef(defaultNewCategoryName);
  // if there are no categories in db add default category 
  const defaultCategoryName = "Books";

  // only on mount fetch categories from db to initialize categories 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const initialCategories = await getAllCategories();
        if (initialCategories && initialCategories.length > 0) {
          setCategories(sortCategories(initialCategories));
        }
        // if initialCategories is null or undefined then add default category to db and set categories to have default category
        else {
          const defaultCategory = { name: defaultCategoryName, isPinned: true, isSelected: false, position: 0 };
          const resultOnAddingDefaultCategory = await addCategory(defaultCategory);
          if (!resultOnAddingDefaultCategory) {
            console.log("Error adding default category");
            return;
          }
          console.log("Default category added successfully");
          setCategories(sortCategories([defaultCategory]));


        }

      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const sortCategories = (categoryArray: Category[]) => {
    return [...categoryArray].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const handleCategoryPress = (category: Category) => {
    // if any category is selected, toggle the selection for the clicked category instead of navigating to category page 
    if (areAnyCategoriesSelected()) {
      const updatedCategories = categories.map((currentCategory) => {
        if (currentCategory.name === category.name) {
          return { ...currentCategory, isSelected: !currentCategory.isSelected };
        }
        return currentCategory;
      });
      setCategories(updatedCategories);
      return;
    }
    // otherwise go to category page 
    router.push(`/library/${category.name}`);
  };

  const handlePinPress = async (categoryName: string) => {
    // getting category with name
    const categoryToBeModified = categories.find((category) => category.name === categoryName);
    if (!categoryToBeModified) {
      return;
    }
    // update category to be pinned in db
    await updateCategory(categoryName, { ...categoryToBeModified, isPinned: !categoryToBeModified.isPinned });
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

  const handleDelete = async () => {
    try {
      // Get all selected categories
      const selectedCategories = getAllSelectedCategories();
      // check if all categories are selected to be deleted
      if (selectedCategories.length === categories.length) {
        return "Cannot delete all categories";
      }
      // Call deleteCategory for each selected category
      await Promise.all(
        selectedCategories.map(async (category) => {
          const resultOfDeletingCategory = await deleteCategory(category.name); // Assuming deleteCategory takes category name as parameter
          { (resultOfDeletingCategory) ? (console.log("Category deleted successfully")) : (console.log("Error deleting category")) }
          const resultOfDeletingUserBooksWithCategoryName = await deleteAllUserBooksByCategory(category.name);
          { (resultOfDeletingUserBooksWithCategoryName) ? (console.log("User books deleted successfully with category name")) : (console.log("Error deleting user books with category name")) }
        })
      );

      // Update state after deletions are complete
      const remainingCategories = categories.filter((category) => !category.isSelected);
      setCategories(sortCategories(remainingCategories));
      setIsDeleteModalVisible(false);
      return "Categories deleted successfully";
    } catch (error) {
      console.error("Error deleting categories:", error);
      return "Error occurred while deleting categories";
    }
  };

  const handleRename = async (newName: string) => {
    try {
      const updatedCategories = [...categories];

      if (newName === "New Category") {
        console.log("New name is New Category");
      }
      console.log("Updated categories:", updatedCategories);

      for (let index = 0; index < updatedCategories.length; index++) {
        const category = updatedCategories[index];

        // get old name
        const oldName = category.name;

        if (category.isSelected) {
          // Generate a unique name for the renamed category
          let newUniqueName = newName;
          let counter = 1;
          while (updatedCategories.some((c) => c.name === newUniqueName)) {
            newUniqueName = `${newName} (${counter})`;
            counter++;
          }

          // Update the selected category's name and deselect it
          updatedCategories[index] = { ...category, name: newUniqueName, isSelected: false };
          const currentUpdatedCategory = updatedCategories[index];

          // Perform async database operation
          if (isAddingCategory) {
            // Add new category
            console.log("Adding new category:", currentUpdatedCategory);
            await addCategory(currentUpdatedCategory); // Add new category
          }
          // renaming a category 
          else {
            await updateCategory(category.name, currentUpdatedCategory); // Update existing category
            // get all user books with old category name 
            const userBooksWithOldCategory = await getAllUserBooksByCategory(oldName);
            // update all user books with new category name only if there are user books with old category name
            if (userBooksWithOldCategory) {
              const result = await updateMultipleUserBooksCategory(userBooksWithOldCategory, newUniqueName);
              { result ? (console.log("User books updated successfully with new category name")) : (console.log("Error updating user books with new category name")) }
            }

          }
        }
      }

      // Update the categories state after renaming
      setCategories(sortCategories(updatedCategories));
      setIsRenameModalVisible(false);
    } catch (error) {
      console.error("Error renaming categories:", error);
    }
  };


  const handleAddCategory = () => {
    if (isAddingCategory) return;
    setIsAddingCategory(true);
    let uniqueName = defaultNewCategoryName;
    let counter = 1;
    while (categories.some((currentCategory) => currentCategory.name === uniqueName)) {
      uniqueName = `${defaultNewCategoryName} (${counter})`;
      counter++;
    }
    NewCategoryNameRef.current = uniqueName;
    const newCategory = { name: uniqueName, isPinned: false, isSelected: true, position: 0 };

    setCategories(sortCategories([...categories, newCategory]));
    setIsRenameModalVisible(true);
  };

  const areAnyCategoriesSelected = () => {
    return categories.some((category) => category.isSelected);
  };

  const deselectAllCategories = () => {
    const updatedCategories = categories.map((category) => ({
      ...category,
      isSelected: false,
    }));
    setCategories(updatedCategories);
  };

  const handleDeletingNewCategoryInRenameModal = () => {
    if (isAddingCategory) {
      const remainingCategories = categories.filter(
        (category) => category.name !== NewCategoryNameRef.current
      );
      setCategories(sortCategories(remainingCategories));
      setIsAddingCategory(false);
    }
  };

  const handleDeselectingNewCategory = () => {
    if (isAddingCategory) {
      setIsAddingCategory(false);
      deselectAllCategories();
    }
  };

  const getAllSelectedCategories = () => {
    return categories.filter((category) => category.isSelected);
  };

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    // do not render new category that is about to be added as it has a temp name and should not be shown until it is actually added
    if ((search === "" || item.name.toLowerCase().includes(search.toLowerCase())) && (NewCategoryNameRef.current !== item.name)) {
      return (
        <View>
          <Pressable
            onPress={() => handleCategoryPress(item)}
            onLongPress={() => handleLongPress(item.name)}
            className={`flex-row items-center justify-between py-4 px-6 
              ${item.isSelected ? "bg-blue-500 opacity-80" : index % 2 === 0 ? "bg-black" : "bg-gray-300"}`}          >
            <View className="items-center flex-1">
              <Text
                className={`text-xl font-semibold ${index % 2 === 0 ? "text-white" : "text-black"}`}
              >
                {item.name}
              </Text>
            </View>
            <Pressable className="p-1" disabled={areAnyCategoriesSelected()} onPress={() => handlePinPress(item.name)}>
              <PinnedIcon isPinned={item.isPinned} />
            </Pressable>
          </Pressable>
        </View>
      );
    }
    return null;
  };

  return (
    <>


      <SafeAreaView className="flex-1">



        {/* Top row for add category icon and search bar */}


        {/* only show search bar if no categories are selected */}

        <View className="flex-row items-center justify-between" >
          <View className="w-[85%] mx-auto">
            <SearchBar placeholder="Search by category name..." onChangeText={updateSearch} value={search} />
          </View>

          <Pressable className="p-2 mx-auto" onPress={handleAddCategory}>

            {(!areAnyCategoriesSelected()) && (<PlusIcon height={38} width={38} />)}


          </Pressable>
        </View>



        {/* Content area to allow FlatList and menu to stack correctly */}
        <View className="flex-1">
          <FlatList data={categories} keyExtractor={(item) => item.name} renderItem={renderItem} />
        </View>

        {/* Bottom menu: shown when categories are selected */}
        {(areAnyCategoriesSelected() && !isAddingCategory) && (


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
