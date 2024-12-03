import React, { useState } from "react";
import { Modal, Pressable, Text, FlatList, View, Switch } from "react-native";
import { Book } from "@/types/book";
import { Checkbox } from "expo-checkbox";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AddBooksOrMoveBooksToCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  booksToAdd: Book[];
  categories: string[]; // Categories passed as props
  onConfirmAddBooks: (categoriesSelected: string[]) => Promise<void>; // Async success handler for adding books
  onConfirmMoveBooks?: (categoriesSelected: string[]) => Promise<void>; // Async success handler for adding books
}

const AddBooksOrMoveBooksToCategoryModal: React.FC<AddBooksOrMoveBooksToCategoryModalProps> = ({
  visible,
  onClose,
  booksToAdd,
  categories,
  onConfirmAddBooks,
  onConfirmMoveBooks,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  // checking if possible to move books
  const isPossibleToMoveBooks = onConfirmMoveBooks !== undefined;
  // true means will be adding books false means will be moving books by default will set to adding books
  const [addOrMoveBooks, setAddOrMoveBooks] = useState(true);
  const [loading, setLoading] = useState(false);

  // Toggle selection of categories
  const toggleCategorySelection = (category: string) => {
    // Clear error message if there is one
    if (errorMessage.length > 0) {
      setErrorMessage("");
    }
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category); // Remove from selection
      } else {
        return [...prev, category]; // Add to selection
      }
    });
  };

  // Handle adding books to selected categories and trigger onSuccess with selected categories
  const handleAddBooks = async () => {
    if (selectedCategories.length === 0) {
      setErrorMessage("Please select at least one category.");
      return;
    }

    try {
      setLoading(true);
      // Call onConfirm with selected categories and books to add
      if (addOrMoveBooks) {
        await onConfirmAddBooks(selectedCategories);
      }
      // otherwise will move books instead
      else if (isPossibleToMoveBooks) {
        await onConfirmMoveBooks(selectedCategories);
      } else {
        console.error("should not happen");
      }
      setSelectedCategories([]); // Reset selections after success
    } catch (error) {
      console.error("Error adding books to categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOrMoveMessage = () => {
    if (addOrMoveBooks) {
      return "Select one or more categories to add the selected books to:";
    } else {
      return "Select one or more categories to move the selected books to:";
    }
  };

  const AddOrMoveSwitch = () => {
    return (
      <View className="flex-row mb-3 items-center">
        <Text className="text-black font-bold text-lg">
          {addOrMoveBooks ? "Add Books:" : "Move Books:"}
        </Text>
        <Switch
          testID="add-or-move-switch"
          value={addOrMoveBooks}
          onValueChange={(value) => setAddOrMoveBooks(value)}
        />
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose}></Pressable>

      <View className="p-4 m-4 bg-white rounded-lg mx-auto w-72">
        <View className="">
          {/* only render switch if possible to move books*/}
          {isPossibleToMoveBooks && AddOrMoveSwitch()}

          <Text className="text-lg text-black font-semibold mb-4">
            {isPossibleToMoveBooks
              ? addOrMoveMessage()
              : "Select one or more categories to add the selected books to:"}
          </Text>
        </View>

        {/* Category selection */}
        <FlatList
          className="max-h-36"
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleCategorySelection(item)}
              className="flex-row items-center mb-2"
            >
              <Checkbox
                value={selectedCategories.includes(item)} // Ensure the checkbox reflects the selected state
                onValueChange={() => toggleCategorySelection(item)} // Toggle state properly
              />
              <Text className="ml-2 text-sm text-gray-800">{item}</Text>
            </Pressable>
          )}
        />

        {/* Display the list of books to be added */}
        <Text className="font-semibold text-gray-800 mt-5 mb-2">
          {addOrMoveBooks ? "Books to add:" : "Books to move:"}
        </Text>
        <FlatList
          className="max-h-36"
          data={booksToAdd}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center b-2">
              <Text className="text-sm text-gray-800">•{item.title} by {item.author}</Text>
            </View>
          )}
        />

        {errorMessage.length > 0 && (
          <Text className="text-red-500">{errorMessage}</Text>
        )}

        {loading ? (
          <View className="w-full h-20" testID="loading-spinner">
            <LoadingSpinner />
          </View>
        ) : (
          <View className="flex-row justify-between mt-4">
            <Pressable
              className="px-4 py-2 bg-blue-500 rounded-lg"
              onPress={handleAddBooks}
            >
              <Text className="text-white">Confirm</Text>
            </Pressable>
            <Pressable
              className="px-4 py-2 mr-2 bg-gray-300 rounded-lg"
              onPress={onClose}
            >
              <Text className="text-gray-800">Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable className="flex-1" onPress={onClose}></Pressable>
    </Modal>
  );
};

export default AddBooksOrMoveBooksToCategoryModal;
