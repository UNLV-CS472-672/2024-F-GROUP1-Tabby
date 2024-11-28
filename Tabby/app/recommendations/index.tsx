import React, { useState, useEffect } from "react";
import { FlatList, Pressable, View, Text } from "react-native";
import BookPreview from "@/components/BookPreview"; // Adjust the path as necessary
import { SafeAreaView } from "react-native-safe-area-context";
import AddButtonIcon from "@/components/AddButtonIcon";
import { SearchBar } from "@rneui/themed";
import {
    getAllCategories,
    getAllRecommendedBooks,
    addRecommendedBook,
    deleteMultipleRecommendedBooksByIds,
    addMultipleUserBooksWithCategoryName,
    updateMultipleRecommendedBooksToBeAddedToLibrary,
} from "@/database/databaseOperations";
import { Book } from "@/types/book";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import AddSquareIcon from "@/assets/menu-icons/add-square-icon.svg";
import CancelIcon from "@/assets/menu-icons/cancel-icon.svg";
import DeleteBooksModal from "@/components/DeleteBooksModal";
import AddBooksOrMoveBooksToCategoryModal from "@/components/AddBooksOrMoveBooksToCategoryModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import axios from "axios";

type SelectableBook = {
    book: Book;
    isSelected: boolean;
};

// test data to see how the recommendation page would look
const defaultBooks: Book[] = [
    {
        "id": "1",
        "isbn": "9780061122415",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "summary": "A gripping, heart-wrenching, and wholly remarkable tale of a young girl in a quiet Southern town and the moral and social struggles of her community.",
        "excerpt": "A novel about racial injustice and the loss of innocence.",
        "image": "https://m.media-amazon.com/images/I/71HZbA0WscL._SY466_.jpg",
        "genres": "Fiction, Historical Fiction, Drama, Classic",
        "notes": "A Pulitzer Prize-winning novel about the themes of racism and morality.",
        "pageCount": 281,
        "publisher": "J.B. Lippincott & Co.",
        "publishedDate": "July 11, 1960",
        "addToLibrary": true,
        "rating": 3
    },
    {
        "id": "2",
        "isbn": "9781451673319",
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "summary": "A story of adolescent alienation and loss of innocence, told through the eyes of Holden Caulfield.",
        "excerpt": "Holden Caulfield is struggling to find his place in the world after being expelled from his prestigious prep school.",
        "image": "https://m.media-amazon.com/images/I/51uEKxRBCHL._SY445_SX342_.jpg",
        "genres": "Fiction, Coming-of-Age, Literary Fiction",
        "notes": "A controversial yet beloved classic about the trials and tribulations of teenage angst.",
        "pageCount": 214,
        "publisher": "Little, Brown and Company",
        "publishedDate": "July 16, 1951",
        "addToLibrary": true,
        "rating": 2
    },
    {
        "id": "3",
        "isbn": "9780143127796",
        "title": "The Road",
        "author": "Cormac McCarthy",
        "summary": "A haunting post-apocalyptic novel that follows a father and son as they journey through a desolate landscape.",
        "excerpt": "In a world without hope, a father and son strive for survival in the face of unspeakable horrors.",
        "image": "https://m.media-amazon.com/images/I/41GuWgTvzoL._SY445_SX342_.jpg",
        "genres": "Fiction, Post-Apocalyptic, Drama",
        "notes": "A Pulitzer Prize-winning novel that explores human resilience and love in a dystopian world.",
        "pageCount": 287,
        "publisher": "Alfred A. Knopf",
        "publishedDate": "September 26, 2006",
        "addToLibrary": false,
        "rating": 2
    },
    {
        "id": "4",
        "isbn": "9780307454546",
        "title": "The Girl on the Train",
        "author": "Paula Hawkins",
        "summary": "A psychological thriller that explores the lives of three women entangled in a web of lies, deceit, and mystery.",
        "excerpt": "Rachel, an alcoholic woman with a fractured life, gets involved in a missing person investigation that forces her to confront her own demons.",
        "image": "https://m.media-amazon.com/images/I/41tc7XtIfjL._SY445_SX342_.jpg",
        "genres": "Thriller, Mystery, Psychological Fiction, Crime",
        "notes": "A gripping and twisted narrative that keeps readers on edge.",
        "pageCount": 395,
        "publisher": "Riverhead Books",
        "publishedDate": "January 13, 2015",
        "addToLibrary": true,
        "rating": 1
    },
    {
        "id": "5",
        "isbn": "9780399590504",
        "title": "Educated",
        "author": "Tara Westover",
        "summary": "A memoir about a young girl who grows up in a strict, survivalist family in rural Idaho and eventually escapes to receive an education.",
        "excerpt": "Tara Westover’s journey from isolation to academic achievement is both inspiring and heartbreaking.",
        "image": "https://m.media-amazon.com/images/I/41goWDE1PUL._SY445_SX342_QL70_FMwebp_.jpg",
        "genres": "Memoir, Non-fiction, Biography",
        "notes": "A bestseller that showcases the power of education and resilience in the face of adversity.",
        "pageCount": 334,
        "publisher": "Random House",
        "publishedDate": "February 20, 2018",
        "addToLibrary": false,
        "rating": 0
    },
    {
        "id": "6",
        "isbn": "9780743273565",
        "title": "The Book Thief",
        "author": "Markus Zusak",
        "summary": "A story set during WWII narrated by Death itself, focusing on the life of a young girl, Liesel, and her love of books in Nazi Germany.",
        "excerpt": "Liesel finds solace in stealing books amidst the chaos of war and discovers the power of words.",
        "image": "https://m.media-amazon.com/images/I/41RKGjq-XGL._SY445_SX342_.jpg",
        "genres": "Fiction, Historical Fiction, Young Adult",
        "notes": "A deeply moving and beautifully written tale about the impact of books and words during wartime.",
        "pageCount": 552,
        "publisher": "Alfred A. Knopf",
        "publishedDate": "March 14, 2006",
        "addToLibrary": true,
        "rating": 0
    }
]


const defaultSelectableBooks: SelectableBook[] = defaultBooks.map(
    (currentBook) => ({ book: currentBook, isSelected: false })
);

const size = 36;

const baseAPIUrlRender = "https://group1-tabby.onrender.com/";
const baseAPIUrlKoyeb = "https://just-ulrike-tabby-app-9d270e1b.koyeb.app/"


// will make a call to the server to get recommended books using book array passed
const getRecommendedBooksFromServerBasedOnBooksPassed = async (booksToUseForRecommendations: Book[]) => {
    const baseUrl = baseAPIUrlKoyeb;

}

// will make a call to the server to get books based on what is in the search bar  will use query param to search by isbn or phrase
const getBooksFromServerBasedOnSearch = async (search: string) => {
    const baseUrl = baseAPIUrlKoyeb; // Ensure baseAPIUrlKoyeb is properly defined
    const isbnRegex = /^\d{13}$/; // Regular expression for ISBN-13

    try {
        // Determine whether to search by ISBN or phrase
        const queryParam = isbnRegex.test(search)
            ? `isbn=${search}`
            : `phrase=${encodeURIComponent(search)}`;

        // Make the API call
        const response = await axios.get(`${baseUrl}/search?${queryParam}`);

        if (response.status === 200) {
            const { message, results, resultsCount } = response.data;

            console.log("Search Results:", { message, results, resultsCount });

            // Return the results or handle as needed
            return results;
        } else {
            console.error("Unexpected status code:", response.status);
            return [];
        }
    } catch (error) {
        console.error("Error fetching books from server:", error);
        return [];
    }
};


const Recommendations = () => {
    // State to keep track of books and their selected status
    const [selectableBooks, setSelectableBooks] = useState<SelectableBook[]>(
        defaultSelectableBooks
    );
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [isAddingBookModalVisible, setIsAddingBookModalVisible] = useState(
        false
    );
    const [
        pressedAddBookToLibraryButtonFromBookPreview,
        setPressedAddBookToLibraryButtonFromBookPreview,
    ] = useState(false);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        // Fetch books from the database when the component mounts
        const fetchBooksAndCategories = async () => {
            try {
                const initialBooks = await getAllRecommendedBooks();
                // check if initialBooks is an array of books
                if (Array.isArray(initialBooks)) {
                    // check if  initialBooks is empty i it is then add default books to db
                    if (initialBooks.length === 0) {
                        // add default books to the database
                        defaultBooks.forEach(async (book) => {
                            await addRecommendedBook(book);
                        });

                        // fetch books from the database again and set the books to have the updated uuids
                        const resultWithAddedBooks = await getAllRecommendedBooks();
                        if (Array.isArray(resultWithAddedBooks)) {
                            setSelectableBooks(
                                resultWithAddedBooks.map((book) => ({
                                    book,
                                    isSelected: false,
                                }))
                            );
                        }
                    }
                    // setting if initial books is not empty
                    else {
                        setSelectableBooks(
                            initialBooks.map((book) => ({ book, isSelected: false }))
                        );
                    }

                    // setting categories
                    const initialCategories = await getAllCategories();
                    if (Array.isArray(initialCategories)) {
                        setCategories(initialCategories.map((category) => category.name));
                    }
                }
            } catch (error) {
                console.error("Failed to load books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooksAndCategories();
    }, []);

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    // will change the state of the book to add to library
    const handleAddToLibraryPress = async (bookId: string) => {
        // pressed button multiple times
        if (pressedAddBookToLibraryButtonFromBookPreview) {
            return;
        } else {
            setPressedAddBookToLibraryButtonFromBookPreview(true);
        }
        // toggle book as selected this will update local state
        toggleSelectedBook(bookId);

        // open add books modal to add selected book
        setIsAddingBookModalVisible(true);
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

    // book add button to be passed as a prop to the book previews
    const renderBookButton = (currentSelectableBook: SelectableBook) => (
        <Pressable
            onPress={() => handleAddToLibraryPress(currentSelectableBook.book.id)}
            className="ml-4"
        >
            <AddButtonIcon isAdded={false} />
        </Pressable>
    );

    // delete selected books
    const deleteSelectedBooks = async () => {
        const selectedBookIds = getAllSelectedBookIds();
        const unselectedSelectableBooks = getUnselectedSelectableBooks();
        const result = await deleteMultipleRecommendedBooksByIds(selectedBookIds);
        if (result) {
            console.log("deleted all recommended books that were selected");
            setSelectableBooks(unselectedSelectableBooks);
            setIsDeleteModalVisible(false);
        } else {
            console.error("Failed to delete recommended books that were selected");
        }
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
            const booksSetToAddedToLibrary = selectedBookObjects.map((book) => ({
                ...book,
                addToLibrary: true,
            }));
            const updateBookToAddedToLibraryResult = await updateMultipleRecommendedBooksToBeAddedToLibrary(
                booksSetToAddedToLibrary
            );
            if (!updateBookToAddedToLibraryResult) {
                console.error("Failed to add selected books to all categories");
                return;
            }

            //set local state of selectable books
            const updatedSelectableBooks = selectableBooks.map(
                (currentSelectableBook) => {
                    const updatedBook = booksSetToAddedToLibrary.find(
                        (book) => book.id === currentSelectableBook.book.id
                    );
                    return updatedBook
                        ? { isSelected: false, book: updatedBook }
                        : currentSelectableBook;
                }
            );
            setSelectableBooks(updatedSelectableBooks);
            setIsAddingBookModalVisible(false);
            // if add button was pressed reset it to false after adding it
            if (pressedAddBookToLibraryButtonFromBookPreview) {
                setPressedAddBookToLibraryButtonFromBookPreview(false);
            }
        } else {
            console.error("Failed to add selected books to all categories");
        }
    };

    // will deselect added book that was added by pressing + button in book preview
    const hideAddBooksModal = () => {
        if (pressedAddBookToLibraryButtonFromBookPreview) {
            deselectAllBooks();
            setIsAddingBookModalVisible(false);
            setPressedAddBookToLibraryButtonFromBookPreview(false);
        } else {
            setIsAddingBookModalVisible(false);
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

    // if the string typed in the search bar is a part of a book title, isbn, or author then render the book
    const renderItem = ({ item }: { item: SelectableBook }) => {
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
                    isRecommendation={true}
                    toggleSelected={toggleSelectedBook}
                    selectedBooks={getAllSelectedBookIds()}
                />
            );
        }
        return null;
    };

    const RecommendationsPage = () => {
        return (
            <SafeAreaView className="flex-1">
                <SearchBar
                    placeholder="Search by title, ISBN, or author..."
                    onChangeText={updateSearch}
                    value={search}
                />
                <View className="flex-1">
                    <FlatList
                        data={selectableBooks}
                        keyExtractor={(item) => item.book.id}
                        renderItem={renderItem}
                    />
                </View>

                {areAnyBooksSelected() && !pressedAddBookToLibraryButtonFromBookPreview && (
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
                                onPress={() => setIsAddingBookModalVisible(true)}
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
                    visible={isAddingBookModalVisible}
                    onClose={() => hideAddBooksModal()}
                    booksToAdd={getBookObjectsFromSelectableBooksPassed(
                        getSelectedSelectableBooks()
                    )}
                    categories={categories}
                    onConfirmAddBooks={handleAddSelectedBooksToCategories}
                />
            </SafeAreaView>
        );

    }

    // will render main component if not loading
    return (
        loading ? (
            <LoadingSpinner />
        ) : (
            RecommendationsPage()
        )

    );

};

export default Recommendations;