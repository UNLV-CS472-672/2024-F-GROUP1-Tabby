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
import SelectedMenu from "@/components/categories/SelectedMenu";
import BarsIcon from "@/components/categories/BarsIcon";

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
  const [search, setSearch] = useState("");
  const defaultNewCategoryName = "New Category";
  const NewCategoryNameRef = useRef(defaultNewCategoryName);

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
    const remainingCategories = categories.filter(
      (category) => !category.isSelected
    );
    setCategories(sortCategories(remainingCategories));
    setIsDeleteModalVisible(false);
  };

  const handleRename = (newName: string) => {
    const updatedCategories = [...categories];
    updatedCategories.forEach((category, index) => {
      if (category.isSelected) {
        let uniqueName = newName;
        let counter = 1;
        while (updatedCategories.some((c) => c.name === uniqueName)) {
          uniqueName = `${newName} (${counter})`;
          counter++;
        }
        updatedCategories[index] = { ...category, name: uniqueName, isSelected: false };
      }
    });
    setCategories(sortCategories(updatedCategories));
    setIsRenameModalVisible(false);
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
