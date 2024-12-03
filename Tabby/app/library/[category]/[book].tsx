import { View, Pressable, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import BookCard from "@/components/book/BookCard";
import ScrollableHorizontalList from "@/components/book/ScrollableHorizontalList";
import { Book } from "@/types/book";
import { useEffect, useState } from "react";
import FavoriteButtonIcon from "@/components/FavoriteButtonIcon";
import MenuIcon from "@/components/book/MenuIcon";
import AddOrMoveSingleBookModal from "@/components/book/AddOrMoveSingleBookModal";
import UpdateRatingModal from "@/components/book/UpdateRatingModal";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import DeleteBookModal from "@/components/book/DeleteBookModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpdateBookNotesModal from "@/components/book/UpdateBookNotesModal";
import EditIcon from "@/assets/book/edit-pen-icon.svg";

import {
  getUserBookById,
  deleteUserBookById,
  updateUserBook,
  getAllCategories,
  addUserBook,
} from "@/database/databaseOperations";
import { useRouter } from "expo-router";

const BookPage = () => {
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [
    isAddOrMoveBookModalVisible,
    setIsAddOrMoveBookModalVisible,
  ] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book>({
    id: "default",
    title: "",
    author: "",
    excerpt: "",
    summary: "",
    image: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [
    isUpdateBookNotesModalVisible,
    setIsUpdateNotesModalVisible,
  ] = useState(false);

  const [isRateBookModalVisible, setIsRateBookModalVisible] = useState(false);

  // handles Showing Rate Book Modal and closing it
  const handleShowingRateBookModal = () => {
    if (isRateBookModalVisible) {
      return;
    } else {
      setIsRateBookModalVisible(true);
    }
  };
  const handleClosingRateBookModal = () => {
    if (isRateBookModalVisible) {
      setIsRateBookModalVisible(false);
    }
  };

  // function to update book to rating passed
  const handleUpdatingBookRating = async (newRating: 0 | 1 | 2 | 3 | 4 | 5) => {
    // will update book rating if different
    if (newRating !== currentBook.rating) {
      const updatedBook = { ...currentBook, rating: newRating };
      const result = updateUserBook(updatedBook);
      if (!result) {
        Alert.alert("Failed to update book :(");
      }
      setCurrentBook(updatedBook);
      Alert.alert("Updated book rating!");
    }
    handleClosingRateBookModal();
  };

  // Extract both category and book slugs
  const { category, book } = useLocalSearchParams();


  // get book data from database
  useEffect(() => {
    const fetchBookDataAndCategories = async () => {
      try {
        const bookResponse = await getUserBookById(book as string);
        const categoriesResponse = await getAllCategories();

        // set current book if not empty
        if (bookResponse) {
          setCurrentBook(bookResponse);
        }
        // set categories if not empty
        if (categoriesResponse) {
          setCategories(
            categoriesResponse
              .map((currentCategory) =>
                currentCategory.name !== (category as string)
                  ? currentCategory.name
                  : ""
              )
              .filter((category) => category !== "")
          );
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDataAndCategories();
  }, [book, category]);

  const genresAsArray = currentBook.genres?.split(",") || [];
  const otherData = [
    `Pages ${currentBook?.pageCount || "Unknown"}`,
    `Published by ${currentBook?.publisher || "Unknown"}`,
    `First Published ${currentBook?.publishedDate || "Unknown"}`,
  ];

  const handleAddBookToSelectedCategories = async (
    selectedCategories: string[]
  ) => {

    let wasAbleToAddBookToAllCategories = true;
    for (const currentCategory of selectedCategories) {
      const bookToBeAddedToCategory = {
        ...currentBook,
        category: currentCategory,
      };
      const result = await addUserBook(bookToBeAddedToCategory);
      if (!result) {
        wasAbleToAddBookToAllCategories = false;
        console.error(`Failed to add book to ${currentCategory}`);
      }
    }

    if (!wasAbleToAddBookToAllCategories) {
      Alert.alert("Error occurred while adding books to category");
      return false;
    }

    // closing modal
    setIsAddOrMoveBookModalVisible(false);
    Alert.alert("Successfully added book to all categories");
    return true;
  };

  const handleMoveBookToSelectedCategories = async (
    selectedCategories: string[]
  ) => {
    // add books to categories and will also close modal
    const resultOfAddingBook = await handleAddBookToSelectedCategories(
      selectedCategories
    );
    // could not add book to categories so do not delete book
    if (!resultOfAddingBook) {
      Alert.alert(
        "Could not add book to selected categories, so will not delete book!"
      );
      return;
    }

    // was able to add boos so delete the book
    const deleteResult = await deleteUserBookById(currentBook.id);
    if (!deleteResult) {
      console.error("Error occurred while deleting book");
      Alert.alert(
        `Book was added to categories. But error occurred while deleting book`
      );
    }

    Alert.alert("Moved books to categories. Will be moving to Library page.");
    router.push("/library");
  };

  const handleFavoritePress = async () => {
    const updatedBook = { ...currentBook, isFavorite: !currentBook.isFavorite };
    const result = await updateUserBook(updatedBook);
    if (!result) {
      console.error("Failed to update user book");
      return;
    }
    setCurrentBook(updatedBook);
  };

  const handleDeleteBook = async () => {
    setIsDeleteModalVisible(false);
    // deleting book from db
    deleteUserBookById(book as string);
    Alert.alert(
      "Successfully deleted book! Will be moving to category page: " +
      category +
      "."
    );
    router.push(`/library/${category}`);
  };

  const handleUpdateNotes = async (newNotes: string) => {
    // Update local state
    const updatedBook = { ...currentBook, notes: newNotes };
    setCurrentBook(updatedBook);

    // Update the database
    const result = await updateUserBook(updatedBook);
    if (!result) {
      console.error("Failed to update notes in the database");
    }
  };

  const handleShowingAddOrMoveMenu = () => {
    // user clicked button twice so do not show
    if (isAddOrMoveBookModalVisible) {
      return;
    }
    if (categories.length !== 0) {
      setIsAddOrMoveBookModalVisible(true);
    } else {
      Alert.alert("No other categories to move or add books to!");
    }
  };

  const handleShowingDeleteMenu = () => {
    // person pressed delete button multiple times
    if (isDeleteModalVisible) {
      return;
    }

    setIsDeleteModalVisible(true);
  };

  const handleShowUpdateNotesModal = () => {
    if (isUpdateBookNotesModalVisible) {
      return;
    }
    setIsUpdateNotesModalVisible(true);
  };

  // main book page
  const BookPage = () => {
    return (
      <>
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-end items-center">
            <Text className="flex-1 text-white text-2xl font-semibold ml-8 mt-2">
              {currentBook.category}
            </Text>

            <Pressable
              className="p-1 mr-2"
              onPress={() => handleShowingDeleteMenu()}
            >
              <DeleteIcon width={40} height={40} />
            </Pressable>

            {/* Delete Modal */}

            <DeleteBookModal
              visible={isDeleteModalVisible}
              onClose={() => setIsDeleteModalVisible(false)}
              onConfirm={handleDeleteBook}
            />

            <Pressable
              onPress={() => handleFavoritePress()}
              className=" p-1 mr-2"
            >
              <FavoriteButtonIcon
                isFavorite={currentBook.isFavorite || false}
                StrokeColor="white"
              />
            </Pressable>

            {/* modal for adding or moving current book*/}
            <Pressable
              onPress={() => handleShowingAddOrMoveMenu()}
              className="p-1 mr-2"
            >
              <MenuIcon isSelected={isAddOrMoveBookModalVisible} />
            </Pressable>
            <AddOrMoveSingleBookModal
              visible={isAddOrMoveBookModalVisible}
              onClose={() => setIsAddOrMoveBookModalVisible(false)}
              categories={categories}
              onConfirmAddBook={handleAddBookToSelectedCategories}
              onConfirmMoveBook={handleMoveBookToSelectedCategories}
            />
          </View>

          <View>
            <BookCard
              book={currentBook}
              showBookRatingModal={handleShowingRateBookModal}
            />

            {/* */}
            <UpdateRatingModal
              isVisible={isRateBookModalVisible}
              onClose={handleClosingRateBookModal}
              onSubmit={handleUpdatingBookRating}
              currentRating={currentBook.rating || 0}
            />
          </View>

          {genresAsArray.length > 0 && (
            <View className="pl-1 pt-5">
              <ScrollableHorizontalList listOfStrings={genresAsArray} />
            </View>
          )}

          <View className="pl-1 pt-5">
            <ScrollableHorizontalList listOfStrings={otherData} />
          </View>

          <View className="pl-5 pt-5 flex justify-center">
            <View className="flex-row items-center">
              <Text className="text-white text-xl ml-1 mr-2">Notes</Text>
              <Pressable
                className="p-1"
                onPress={() => handleShowUpdateNotesModal()}
              >
                <EditIcon height={25} width={25} />
              </Pressable>

              {/* Update Notes Modal */}
              {isUpdateBookNotesModalVisible && (
                <UpdateBookNotesModal
                  visible={isUpdateBookNotesModalVisible}
                  notes={currentBook.notes || ""}
                  onClose={() => setIsUpdateNotesModalVisible(false)}
                  onUpdateNotes={handleUpdateNotes}
                />
              )}
            </View>

            <ScrollView className="max-h-20 sm:max-h-24 pl-1">
              <Text className="text-sm text-white max-w-[90%] p-1 text-start">
                {currentBook.notes}
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </>
    );
  };

  // will render main component if not loading
  return loading ? <LoadingSpinner /> : BookPage();
};

export default BookPage;
