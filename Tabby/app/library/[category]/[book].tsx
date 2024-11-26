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
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import DeleteBookModal from "@/components/book/DeleteBookModal";
import LoadingSpinner from "@/components/LoadingSpinner";

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

    // Extract both category and book slugs
    const { category, book } = useLocalSearchParams();

    console.log(book, "is from", category);

    // get book data from database
    useEffect(() => {
        const fetchBookDataAndCategories = async () => {
            try {
                const bookResponse = await getUserBookById(book as string);
                const categoriesResponse = await getAllCategories();

                console.log(bookResponse);
                console.log(categoriesResponse);
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
        console.log(`Moving book to this category: ${selectedCategories}`);

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
        console.log(`Deleting ${book} from ${category}`);
        // deleting book from db
        deleteUserBookById(book as string);
        router.push(`/library/${category}`);
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

    // main book page
    const BookPage = () => {

        return (
            <>
                <SafeAreaView className="flex-1">
                    <View className="flex-row justify-end items-center">
                        <Pressable
                            className="p-1 mr-2"
                            onPress={() => handleShowingDeleteMenu}
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
                            bookToAdd={currentBook}
                            categories={categories}
                            onConfirmAddBook={handleAddBookToSelectedCategories}
                            onConfirmMoveBook={handleMoveBookToSelectedCategories}
                        />
                    </View>

                    <View>
                        <BookCard book={currentBook} />
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
                        <Text className="text-lg text-white"> My Notes</Text>

                        <ScrollView className="max-h-40 pl-1">
                            <Text className="text-sm text-white max-w-sm text-start">
                                {currentBook.notes}
                            </Text>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    // will render main component if not loading
    return (
        loading ? (
            <LoadingSpinner />
        ) : (
            BookPage()
        )

    );

};

export default BookPage;