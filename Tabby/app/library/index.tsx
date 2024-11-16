import { useRouter } from "expo-router";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useState, useRef } from "react";
import PinnedIcon from "@/components/categories/PinnedIcon";
import RenameModal from "@/components/categories/RenameModal";
import DeleteConfirmationModal from "@/components/categories/DeleteConfirmationModal";
import { Category } from "@/types/category";
import { SearchBar } from "@rneui/themed";
import { useEffect } from "react";
import SelectedMenu from "@/components/categories/SelectedMenu";
import { getAllCategories, addCategory, deleteCategory, updateCategory } from "@/database/databaseOperations";


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

  // only on mount fetch categories from db to initialize categories 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const initialCategories = await getAllCategories();
        setCategories(sortCategories(initialCategories || []));
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
      // Call deleteCategory for each selected category
      await Promise.all(
        selectedCategories.map(async (category) => {
          await deleteCategory(category.name); // Assuming deleteCategory takes category name as parameter
        })
      );

      // Update state after deletions are complete
      const remainingCategories = categories.filter((category) => !category.isSelected);
      setCategories(sortCategories(remainingCategories));
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting categories:", error);
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

        if (category.isSelected) {
          // Generate a unique name for the renamed category
          let uniqueName = newName;
          let counter = 1;
          while (updatedCategories.some((c) => c.name === uniqueName)) {
            uniqueName = `${newName} (${counter})`;
            counter++;
          }

          // Update the selected category's name and deselect it
          updatedCategories[index] = { ...category, name: uniqueName, isSelected: false };
          const currentUpdatedCategory = updatedCategories[index];

          // Perform async database operation
          if (isAddingCategory) {
            // Add new category
            console.log("Adding new category:", currentUpdatedCategory);
            await addCategory(currentUpdatedCategory); // Add new category
          } else {
            await updateCategory(category.name, currentUpdatedCategory); // Update existing category
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
    if (search === "" || item.name.toLowerCase().includes(search.toLowerCase())) {
      return (
        <View>
          <Pressable
            onPress={() => handleCategoryPress(item)}
            onLongPress={() => handleLongPress(item.name)}
            className={`flex-row items-center justify-between py-4 px-6 
              ${item.isSelected ? "bg-blue-500" : index % 2 === 0 ? "bg-black" : "bg-gray-300"}`}          >
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
        <View className="flex-row justify-end">

          {/* only show search bar if no categories are selected */}

          {!areAnyCategoriesSelected() && <View className="w-[85%]" >
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search} />
          </View>}
          <Pressable className="p-2" onPress={handleAddCategory}>
            <FontAwesome
              name="plus"
              size={areAnyCategoriesSelected() || isAddingCategory ? 0 : 46}
              color="white"
            />
          </Pressable>
        </View>

        {/* Content area to allow FlatList and menu to stack correctly */}
        <View className="flex-1">
          <FlatList data={categories} keyExtractor={(item) => item.name} renderItem={renderItem} />
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
