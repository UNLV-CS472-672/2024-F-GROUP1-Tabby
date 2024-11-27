// moved all files to my laptop and pushing from my laptop because no wifi at my house
import { useState, useEffect } from "react";
import {
    FlatList,
    Pressable,
    View,
    Text,
    Alert,
} from "react-native";
import BookPreview from "@/components/BookPreview";
import { SafeAreaView } from "react-native-safe-area-context";
import FavoriteButtonIcon from "@/components/FavoriteButtonIcon";
import { SearchBar } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import {
    getAllUserBooksByCategory,
    addUserBook,
    updateUserBook,
    getUserBookById,
    updateMultipleUserBooksToHaveCategoryPassed,
    addMultipleUserBooksWithCategoryName,
    deleteMultipleUserBooksByIds,
    getAllCategories,
} from "@/database/databaseOperations";
import { Book } from "@/types/book";
import PlusIcon from "@/assets/menu-icons/plus-icon.svg";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import AddSquareIcon from "@/assets/menu-icons/add-square-icon.svg";
import CancelIcon from "@/assets/menu-icons/cancel-icon.svg";
import DeleteBooksModal from "@/components/DeleteBooksModal";
import AddBooksOrMoveBooksToCategoryModal from "@/components/AddBooksOrMoveBooksToCategoryModal";

import AddCustomBookModal from "@/components/AddCustomBookModal";

type SelectableBook = {
    book: Book;
    isSelected: boolean;
};

type CustomBook = {
    title: string;
    author: string;
    summary: string;
    excerpt: string;
    notes: string;
    pageCount: number | null; // Updated type
};


const defaultBooks: Book[] = [
    {
        id: "default",
        title: "",
        author: "",
        summary: "",
        excerpt: "",
        image: "",
        rating: 1,
        genres: "",
        isFavorite: false,
    },
];

const defaultSelectableBooks: SelectableBook[] = defaultBooks.map(
    (currentBook) => ({ book: currentBook, isSelected: false })
);

const size = 36;

const CategoryPage: React.FC = () => {
    const { category } = useLocalSearchParams();
    console.log("Category:", category);
    const [selectableBooks, setSelectableBooks] = useState<SelectableBook[]>(
        defaultSelectableBooks
    );
    const [
        isAddingOrMovingBookModalVisible,
        setIsAddingOrMovingBookModalVisible,
    ] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    // function to check if any books are selected
    const areAnyBooksSelected = () => {
        return selectableBooks.some((book) => book.isSelected);
    };

    // get all selectable books that are selected
    const getSelectedSelectableBooks = () => {
        return selectableBooks.filter(
            (currentSelectableBook) => currentSelectableBook.isSelected
        );
    };

    // function to get all selected book ids
    const getAllSelectedBookIds = () => {
        return selectableBooks
            .filter((book) => book.isSelected)
            .map((book) => book.book.id);
    };

    // get all unselected Selectable book objects
    const getUnselectedSelectableBooks = () => {
        return selectableBooks.filter(
            (currentSelectableBook) => !currentSelectableBook.isSelected
        );
    };

    // will fetch books from database on mount
    useEffect(() => {
        const fetchingBooksFromCategory = async () => {
            try {
                if (!category) {
                    throw new Error("No category found");
                }
                // getting initial books and categories
                const initialBooks = await getAllUserBooksByCategory(
                    category as string
                );
                const allCategories = await getAllCategories();
                if (!allCategories) {
                    throw new Error("No categories in db");
                }
                // setting categories
                const allCategoriesExceptCurrentCategory = allCategories.filter(
                    (currentCategory) => currentCategory.name !== (category as string)
                );
                setCategories(
                    allCategoriesExceptCurrentCategory.map(
                        (currentCategory) => currentCategory.name
                    )
                );

                // check if initialBooks is an array of books
                if (Array.isArray(initialBooks)) {
                    setSelectableBooks(
                        initialBooks.map((currentBook) => ({
                            book: currentBook,
                            isSelected: false,
                        }))
                    );
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };

        fetchingBooksFromCategory();
    }, [category]);

    const [search, setSearch] = useState("");
    const [addCustomBookModalVisible, setAddCustomBookModalVisible] = useState(false);
    const [newCustomBook, setNewCustomBook] = useState<CustomBook>({
        title: "",
        author: "",
        summary: "",
        excerpt: "",
        notes: "",
        pageCount: null,
    });

    const handleFavoritePress = async (bookId: string) => {
        // get user book by id
        const userBook = await getUserBookById(bookId);
        if (!userBook) {
            console.error("Failed to get user book");
            return;
        }
        // update user book
        const updatedUserBook = { ...userBook, isFavorite: !userBook.isFavorite };

        const resultOfUpdatingUserBook = await updateUserBook(updatedUserBook);
        if (!resultOfUpdatingUserBook) {
            console.error("Failed to update user book");
            return;
        }

        const getBookObjectWithTogglingFavorite = (tempBookObject: Book) => {
            const favoriteStatus = tempBookObject.isFavorite || false;
            return { ...tempBookObject, isFavorite: !favoriteStatus };
        };

        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) =>
                currentSelectableBook.book.id === bookId
                    ? {
                        book: getBookObjectWithTogglingFavorite(
                            currentSelectableBook.book
                        ),
                        isSelected: false,
                    }
                    : currentSelectableBook
            )
        );
    };

    // handle adding selected books to categories
    const handleAddSelectedBooksToCategories = async (categories: string[]) => {
        const selectedBookObjects = getBookObjectsFromSelectableBooksPassed(
            getSelectedSelectableBooks()
        );
        let wasAbleToAddBooksToAllCategories = true;
        console.log("selected book objects: ", selectedBookObjects);

        // for each category add the selected books
        for (const category of categories) {
            const resultOfAddingBooksToCurrentCategory = await addMultipleUserBooksWithCategoryName(
                selectedBookObjects,
                category
            );
            if (!resultOfAddingBooksToCurrentCategory) {
                console.error("Failed to add books to current category: ", category);
                wasAbleToAddBooksToAllCategories = false;
            } else {
                console.log("Added books to category: ", category);
            }
        }

        if (wasAbleToAddBooksToAllCategories) {
            console.log("Added selected books to all categories successfully");

            //reset local state of selectable books
            deselectAllBooks();
            setIsAddingOrMovingBookModalVisible(false);
        } else {
            console.error("Failed to add selected books to all categories");
        }
    };

    // handle moving selected books to categories
    const handleMovingSelectedBooksToCategories = async (
        categories: string[]
    ) => {
        const selectedBookObjects = getBookObjectsFromSelectableBooksPassed(
            getSelectedSelectableBooks()
        );
        let wasAbleToMoveBooksToAllCategories = true;
        console.log("selected book objects: ", selectedBookObjects);

        // for each category add the selected books
        for (const category of categories) {
            const resultOfMovingBooksToCurrentCategory = await updateMultipleUserBooksToHaveCategoryPassed(
                selectedBookObjects,
                category
            );
            if (!resultOfMovingBooksToCurrentCategory) {
                console.error("Failed to move books to current category: ", category);
                wasAbleToMoveBooksToAllCategories = false;
            } else {
                console.log("Moved books to category: ", category);
            }
        }

        if (wasAbleToMoveBooksToAllCategories) {
            console.log("Moved selected books to all categories successfully");

            // set local state of selectable books to not have the selected book objects as they have been moved from current category
            const unselectedSelectableBooks = getUnselectedSelectableBooks();
            console.log("Unselected books: ", unselectedSelectableBooks);
            setSelectableBooks(getUnselectedSelectableBooks());

            //reset local state of selectable books
            deselectAllBooks();
            setIsAddingOrMovingBookModalVisible(false);
        } else {
            console.error("Failed to add selected books to all categories");
        }
    };

    const handleShowAddOrMoveBooksModal = () => {
        if (categories.length === 0) {
            Alert.alert("No other categories to move or add books to!");
        } else {
            setIsAddingOrMovingBookModalVisible(true);
        }
    };

    // get book objects array from selectableBooks array
    const getBookObjectsFromSelectableBooksPassed = (
        SelectableBooks: SelectableBook[]
    ) => {
        return SelectableBooks.map(
            (currentSelectableBook) => currentSelectableBook.book
        );
    };

    const renderBookButton = (currentSelectableBook: SelectableBook) => (
        <Pressable
            onPress={() => handleFavoritePress(currentSelectableBook.book.id)}
            className="ml-4"
        >
            <FavoriteButtonIcon
                isFavorite={currentSelectableBook.book.isFavorite || false}
            />
        </Pressable>
    );

    const renderItem = ({ item }: { item: SelectableBook }) => {
        // check if book array has the default book if it does do not render anything meaning category has no books yet
        if (item.book.id === "default") {
            return null;
        }

        const genresAsArray = item.book.genres?.split(",") || [];
        // search by title, author, genre, isbn, or genre
        if (
            search === "" ||
            item.book.title.toLowerCase().includes(search.toLowerCase()) ||
            item.book.author.toLowerCase().includes(search.toLowerCase()) ||
            genresAsArray.some((genre) => genre.toLowerCase().includes(search.toLowerCase())) ||
            item.book.isbn?.toLowerCase() === search
        ) {
            return (
                <BookPreview
                    book={item.book}
                    button={renderBookButton(item)}
                    toggleSelected={toggleSelectedBook}
                    selectedBooks={getAllSelectedBookIds()}
                />
            );
        }
        return null;
    };

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    const toggleSelectedBook = (bookId: string) => {
        console.log(`Toggling selected book: ${bookId}`);
        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) =>
                currentSelectableBook.book.id === bookId
                    ? {
                        ...currentSelectableBook,
                        isSelected: !currentSelectableBook.isSelected,
                    } // Toggle selected status
                    : currentSelectableBook
            )
        );
    };

    // set all books to be deselected
    const deselectAllBooks = () => {
        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) => ({
                ...currentSelectableBook,
                isSelected: false,
            }))
        );
    };

    // delete selected books
    const deleteSelectedBooks = async () => {
        const selectedBookIds = getAllSelectedBookIds();
        const unselectedSelectableBooks = getUnselectedSelectableBooks();
        const result = await deleteMultipleUserBooksByIds(selectedBookIds);
        if (result) {
            console.log("deleted all user books that were selected");
            setSelectableBooks(unselectedSelectableBooks);
            setIsDeleteModalVisible(false);
        } else {
            console.error("Failed to delete user books that were selected");
        }
    };

    const handleAddCustomBook = async () => {
        const newCustomBookDataThatWillBeAdded: Book = {
            id: (selectableBooks.length + 1).toString(),
            title: newCustomBook.title,
            author: newCustomBook.author,
            summary: newCustomBook.summary,
            excerpt: newCustomBook.excerpt,
            image: "",
            rating: 0,
            pageCount: newCustomBook.pageCount || 0,
            notes: newCustomBook.notes,
            genres: "",
            category: category as string,
            isFavorite: false,
            isCustomBook: true,
        };
        const resultOfAddingCustomBook = await addUserBook(
            newCustomBookDataThatWillBeAdded
        );
        if (!resultOfAddingCustomBook) {
            console.error("Failed to add custom book");
            return;
        }
        // add new book to books has to be done after adding to database as the book object that is returned from database has the proper uuid
        setSelectableBooks([
            ...selectableBooks,
            { book: resultOfAddingCustomBook, isSelected: false },
        ]);
        // reset new custom book state
        setNewCustomBook({
            title: "",
            author: "",
            summary: "",
            excerpt: "",
            notes: "",
            pageCount: 0,
        });
        // closing modal
        setAddCustomBookModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between">
                <View className="w-[85%] mx-auto">
                    <SearchBar
                        placeholder="Search by title, ISBN, or author..."
                        onChangeText={updateSearch}
                        value={search}
                    />
                </View>

                <Pressable
                    className="p-2 mx-auto"
                    onPress={() => setAddCustomBookModalVisible(true)}
                >
                    {<PlusIcon height={38} width={38} />}
                </Pressable>
            </View>

            <Text className="text-white text-xl font-bold text-left pl-5 pt-4">{category}</Text>


            <View className="flex-1">
                <FlatList
                    data={selectableBooks}
                    keyExtractor={(item) => item.book.id}
                    renderItem={renderItem}
                />
            </View>

            {areAnyBooksSelected() && (
                <View className="flex-row justify-around bg-[#161f2b] w-full border-t border-blue-500">
                    <View className="">
                        <Pressable
                            className="flex-col items-center"
                            onPress={() => setIsDeleteModalVisible(true)}
                        >
                            <DeleteIcon height={size} width={size} />
                            <Text className="text-white text-sm">Delete </Text>
                        </Pressable>
                    </View>

                    <View>
                        <Pressable
                            className="flex-col items-center"
                            onPress={() => handleShowAddOrMoveBooksModal()}
                        >
                            <AddSquareIcon height={size} width={size} />
                            <Text className="text-white text-sm">Add</Text>
                        </Pressable>
                    </View>

                    <View>
                        <Pressable
                            className="flex-col items-center"
                            onPress={() => deselectAllBooks()}
                        >
                            <CancelIcon height={size} width={size} />
                            <Text className="text-white text-sm">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Delete Books Modal */}
            <DeleteBooksModal
                visible={isDeleteModalVisible}
                onClose={() => setIsDeleteModalVisible(false)}
                booksToDelete={getBookObjectsFromSelectableBooksPassed(
                    getSelectedSelectableBooks()
                )}
                onConfirm={deleteSelectedBooks}
            />

            {/* Add Books to Category Modal */}
            <AddBooksOrMoveBooksToCategoryModal
                visible={isAddingOrMovingBookModalVisible}
                onClose={() => setIsAddingOrMovingBookModalVisible(false)}
                booksToAdd={getBookObjectsFromSelectableBooksPassed(
                    getSelectedSelectableBooks()
                )}
                categories={categories}
                onConfirmAddBooks={handleAddSelectedBooksToCategories}
                onConfirmMoveBooks={handleMovingSelectedBooksToCategories}
            />


            <AddCustomBookModal modalVisible={addCustomBookModalVisible} setModalVisible={setAddCustomBookModalVisible} newCustomBook={newCustomBook} setNewCustomBook={setNewCustomBook} handleAddCustomBook={handleAddCustomBook} />
        </SafeAreaView>
    );
};

export default CategoryPage;