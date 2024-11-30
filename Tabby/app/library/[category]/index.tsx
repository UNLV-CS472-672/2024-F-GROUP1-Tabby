// moved all files to my laptop and pushing from my laptop because no wifi at my house
import { useState, useEffect } from "react";
import {
    FlatList,
    Pressable,
    View,
    Text,
    Alert,
    TextInput,
    Modal,
    ScrollView
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
import SelectIcon from "@/assets/menu-icons/select-icon.svg";
import DeleteBooksModal from "@/components/DeleteBooksModal";
import AddBooksOrMoveBooksToCategoryModal from "@/components/AddBooksOrMoveBooksToCategoryModal";

import LoadingSpinner from "@/components/LoadingSpinner";


type SelectableBook = {
    book: Book;
    isSelected: boolean;
};

interface NewCustomBook {
    title: string;
    author: string;
    summary: string;
    excerpt: string;
    pageCount: number | null;
    notes: string;
}

type FieldData = {
    key: string;
    placeholder: string;
    field: keyof NewCustomBook; // Ensures this matches the fields in NewCustomBook
    isMultiline: boolean;
};

const data: FieldData[] = [
    { key: "Add Title", placeholder: "title", field: "title", isMultiline: false, },
    { key: "Add Author", placeholder: "author", field: "author", isMultiline: false },
    { key: "Add Summary", placeholder: "summary", field: "summary", isMultiline: true },
    { key: "Add Excerpt", placeholder: "excerpt", field: "excerpt", isMultiline: true },
    {
        key: "Add Page Count", placeholder: "Page Count", field: "pageCount", isMultiline: false,
    },
    { key: "Add Notes", placeholder: "Notes", field: "notes", isMultiline: true } // Optional field, no validation required
];


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
    const [loadingInitialBooks, setLoadingInitialBooks] = useState(false);

    /* New custom book state for */
    const [newCustomBook, setNewCustomBook] = useState<NewCustomBook>({
        title: '',
        author: '',
        summary: '',
        excerpt: '',
        pageCount: null,
        notes: ''
    });

    const [touchedInputFieldsForCustomBook, setTouchedInputFieldsForCustomBook] = useState<Record<string, boolean>>({}); // Track touched fields
    const handleInputChange = (field: keyof NewCustomBook, value: string) => {
        setNewCustomBook((prevState) => ({ ...prevState, [field]: value }));
        setTouchedInputFieldsForCustomBook((prevState) => ({ ...prevState, [field]: true })); // Mark field as touched
    };



    // Confirm Button Press
    const handleConfirmForAddingCustomBook = async () => {
        console.log("New custom book (submitted):", newCustomBook);
        console.log("Touched fields:", touchedInputFieldsForCustomBook);
        await handleAddCustomBook();
    };


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
                setLoadingInitialBooks(true);
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
            } finally {
                setLoadingInitialBooks(false);
            }
        };

        fetchingBooksFromCategory();
    }, [category]);

    const [search, setSearch] = useState("");
    const [addCustomBookModalVisible, setAddCustomBookModalVisible] = useState(false);

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
            Alert.alert("Successfully added selected books to all selected categories");
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
        let wasAbleToAddBooksToAllCategories = true;
        const onlyOneSelectedCategory = categories.length === 1;
        console.log("selected book objects: ", selectedBookObjects);

        // if there is only one category we can just update the user books to have that one category
        if (onlyOneSelectedCategory) {
            const resultOfUpdatingUserBooks = await updateMultipleUserBooksToHaveCategoryPassed(
                selectedBookObjects,
                categories[0]
            )

            if (!resultOfUpdatingUserBooks) {
                console.error("Failed to update user books to have category: ", categories[0]);
                wasAbleToAddBooksToAllCategories = false;
            }

        }
        // otherwise we need to add the selected books to each category
        else if (categories.length > 1) {
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
                    console.log("added books to category: ", category);
                }
            }

        }



        if (wasAbleToAddBooksToAllCategories) {
            console.log("added selected books to all categories successfully");

            // delete selected books from current category only if there were more than one category
            if (!onlyOneSelectedCategory) {
                const resultOfDeletingSelectedBooks = await deleteMultipleUserBooksByIds(
                    getAllSelectedBookIds()
                )
                if (!resultOfDeletingSelectedBooks) {
                    Alert.alert("Failed to delete selected books in current category");
                }
            }



            // set local state of selectable books to not have the selected book objects as they have been moved from current category
            const unselectedSelectableBooks = getUnselectedSelectableBooks();
            console.log("Unselected books: ", unselectedSelectableBooks);
            setSelectableBooks(getUnselectedSelectableBooks());

            setIsAddingOrMovingBookModalVisible(false);
            Alert.alert("Successfully moved selected books to all selected categories");
        } else {
            Alert.alert("Failed to add selected books to all categories");
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
            Alert.alert("Successfully deleted selected books");
        } else {
            console.error("Failed to delete user books that were selected");
        }
    };

    const selectAllBooks = () => {
        // set all books to selected
        const updatedSelectableBooks = selectableBooks.map((book) => ({
            ...book,
            isSelected: true,
        }))
        setSelectableBooks(updatedSelectableBooks);
    }

    const handleAddCustomBook = async () => {
        console.log("New custom book (submitted):", newCustomBook);
        const newCustomBookDataThatWillBeAdded: Book = {
            id: (selectableBooks.length + 1).toString() + newCustomBook.title,
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
            Alert.alert("Failed to add custom book");
            return false;
        }
        // add new book to books has to be done after adding to database as the book object that is returned from database has the proper uuid
        setSelectableBooks([
            ...selectableBooks,
            { book: resultOfAddingCustomBook, isSelected: false },
        ]);
        console.log("Added custom book to local state:", resultOfAddingCustomBook);
        // resetting custom book if added 
        setNewCustomBook({ title: '', author: '', summary: '', excerpt: '', pageCount: null, notes: '' });
        Alert.alert("Custom book added successfully!");
        // reset new custom book state
        setAddCustomBookModalVisible(false);
        return true;
    };

    return (

        <SafeAreaView className="flex-1">
            {loadingInitialBooks ? <View className="w-full h-full">
                <LoadingSpinner />
            </View> : <>
                <View className="flex-row items-center justify-between">
                    <View className="w-[90%] h-16 mx-auto">
                        <SearchBar
                            placeholder="Search by title, author, genre, or isbn"
                            onChangeText={updateSearch}
                            value={search}
                        />
                    </View>

                    <Pressable
                        className="p-1"
                        onPress={() => setAddCustomBookModalVisible(true)}
                    >
                        {<PlusIcon height={35} width={35} />}
                    </Pressable>
                </View>

                <View className="flex-row items-center pt-4 pl-4">
                    <ScrollView className="max-h-8">
                        <Text className="text-white text-xl font-bold text-left">{category}</Text>
                    </ScrollView>
                    <View className="flex-row  ml-auto">
                        <Pressable className="mr-1" onPress={() => selectAllBooks()}><SelectIcon height={35} width={35} /></Pressable>
                    </View>

                </View>



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

                {/* Add Custom Book Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={addCustomBookModalVisible}
                    onRequestClose={() => setAddCustomBookModalVisible(false)}
                >
                    {/* close modal on background tap */}
                    <Pressable className="flex-1" onPress={() => setAddCustomBookModalVisible(false)}></Pressable>
                    <View className="flex-1 justify-center items-center">
                        <View className="w-4/5 p-6 bg-white rounded-lg">
                            <FlatList
                                data={data}
                                renderItem={({ item }) => (
                                    <View className="mb-4">
                                        <Text className="text-lg font-medium mb-2">{item.key}</Text>

                                        <TextInput
                                            placeholder={item.placeholder}
                                            value={String(newCustomBook[item.field] ?? "")}  // Ensures it's a string
                                            onChangeText={(text) => handleInputChange(item.field, text)}
                                            className="border-b border-gray-300 p-2"
                                            multiline={item.isMultiline}
                                            numberOfLines={item.isMultiline ? 4 : 1}
                                        />
                                    </View>
                                )}
                                keyExtractor={(item) => item.key}
                                className="max-h-52"
                            />
                            <View className="mt-4">
                                <Pressable
                                    className="bg-blue-500 rounded p-2 mb-4"
                                    onPress={handleConfirmForAddingCustomBook}
                                >
                                    <Text className="text-white text-center">Confirm</Text>
                                </Pressable>
                                <Pressable
                                    className="bg-red-500 rounded p-2"
                                    onPress={() => setAddCustomBookModalVisible(false)}
                                >
                                    <Text className="text-white text-center">Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    {/* close modal on background tap */}
                    <Pressable className="flex-1" onPress={() => setAddCustomBookModalVisible(false)}></Pressable>
                </Modal>
            </>}


        </SafeAreaView>
    );
};

export default CategoryPage;