import { View, Pressable, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import BookCard from "@/components/book/BookCard";
import ScrollableHorizontalList from "@/components/book/ScrollableHorizontalList";
import { Book } from "@/types/book";
import { useEffect, useState } from "react";
import AddOrMoveSingleBookModal from "@/components/book/AddOrMoveSingleBookModal";
import AddButtonIcon from "@/components/AddButtonIcon";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import DeleteBookModal from "@/components/book/DeleteBookModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpdateBookNotesModal from "@/components/book/UpdateBookNotesModal";
import EditIcon from "@/assets/book/edit-pen-icon.svg"


import {
    getRecommendedBookById,
    deleteRecommendedBookById,
    updateRecommendedBook,
    getAllCategories,
    addUserBook,
} from "@/database/databaseOperations";
import { useRouter } from "expo-router";

const BookPage = () => {
    const router = useRouter();
    const [
        isAddOrMoveBookModalVisible,
        setIsAddOrMoveBookModalVisible,
    ] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book>({
        id: "default",
        title: "",
        author: "",
        excerpt: "",
        summary: "",
        image: "",
        addToLibrary: false,
    });
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdateBookNotesModalVisible, setIsUpdateNotesModalVisible] = useState(false);


    // Extract both category and book slugs
    const { book } = useLocalSearchParams();

    // get book data from database
    useEffect(() => {
        const fetchBookDataAndCategories = async () => {
            try {
                const bookResponse = await getRecommendedBookById(book as string);
                const categoriesResponse = await getAllCategories();


                if (bookResponse) {
                    setCurrentBook(bookResponse);
                }
                // set categories if not empty
                if (categoriesResponse) {
                    setCategories(
                        categoriesResponse.map((currentCategory) => currentCategory.name)
                    );
                }
            } catch (error) {
                console.error("Error fetching book data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDataAndCategories();
    }, [book]);

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
            const bookToBeAddedToCategory: Book = {
                ...currentBook,
                rating: 0,
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

        // updating book in recommended books to be added to library if it was not already added
        // update recommended book in db
        if (!currentBook.addToLibrary) {
            const updatedBook = { ...currentBook, addToLibrary: true };
            const updatedResult = await updateRecommendedBook(updatedBook);
            if (!updatedResult) {
                console.error("Failed to update recommended book");
                return false;
            }
            setCurrentBook(updatedBook);

            // closing modal
            setIsAddOrMoveBookModalVisible(false);
        }
        return true;
    };

    const handleDeleteBook = async () => {
        setIsDeleteModalVisible(false);
        console.log(`Deleting ${book} from recommendations`);
        // deleting book from db
        const result = await deleteRecommendedBookById(book as string);
        if (!result) {
            console.error("Failed to delete recommended book!");
            Alert.alert("Failed to delete recommended book!");
        }
        router.push("/recommendations");
    };

    const handleUpdateNotes = async (newNotes: string) => {
        // Update local state
        const updatedBook = { ...currentBook, notes: newNotes };
        setCurrentBook(updatedBook);

        // Update the database
        const result = await updateRecommendedBook(updatedBook);
        if (!result) {
            console.error("Failed to update notes in the database");
        }
    };

    const handleShowingDeleteMenu = () => {
        // user clicked button twice so do not show
        if (isDeleteModalVisible) {
            return;
        }
        setIsDeleteModalVisible(true);
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

    const handleShowUpdateNotesModal = () => {
        if (isUpdateBookNotesModalVisible) {
            return;
        }
        setIsUpdateNotesModalVisible(true);
    }



    const BookPage = () => {
        return (
            <>
                <SafeAreaView>
                    <View className="flex-row justify-end items-center">
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
                            onPress={() => handleShowingAddOrMoveMenu()}
                            className="p-1 mr-2"
                        >
                            <AddButtonIcon isAdded={isAddOrMoveBookModalVisible} />
                        </Pressable>
                        {/* Custom DropdownMenu */}
                        <AddOrMoveSingleBookModal
                            visible={isAddOrMoveBookModalVisible}
                            onClose={() => setIsAddOrMoveBookModalVisible(false)}
                            categories={categories}
                            onConfirmAddBook={handleAddBookToSelectedCategories}
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
                        <View className="flex-row items-center">
                            <Text className="text-white text-xl ml-1 mr-2">Notes</Text>
                            <Pressable className="p-1" onPress={() => handleShowUpdateNotesModal()}>
                                <EditIcon height={25} width={25} />
                            </Pressable>


                            {/* Update Notes Modal */}
                            {isUpdateBookNotesModalVisible && (<UpdateBookNotesModal
                                visible={isUpdateBookNotesModalVisible}
                                notes={currentBook.notes || ""}
                                onClose={() => setIsUpdateNotesModalVisible(false)}
                                onUpdateNotes={handleUpdateNotes}
                            />)}

                        </View>


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