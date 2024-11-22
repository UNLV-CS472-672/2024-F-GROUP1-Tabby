import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, Button, View, Text } from 'react-native';
import BookPreview from '@/components/BookPreview'; // Adjust the path as necessary
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButtonIcon from '@/components/AddButtonIcon';
import { SearchBar } from "@rneui/themed";
import { getAllCategories, getAllRecommendedBooks, addRecommendedBook, deleteRecommendedBookById, updateRecommendedBook, getRecommendedBookById } from "@/database/databaseOperations";
import { Book } from "@/types/book";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import RenameIcon from "@/assets/menu-icons/rename-icon.svg";
import AddSquareIcon from "@/assets/menu-icons/add-square-icon.svg"
import CancelIcon from "@/assets/menu-icons/cancel-icon.svg";

type SelectableBook = {
    book: Book,
    isSelected: boolean
}

// test data to see how the recommendation page would look
const defaultBooks: Book[] = [
    {
        id: '1',
        isbn: '9780333791035',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        genres: 'Fiction,History,Classic,Drama,Romance,Adventure,Tragedy',
        notes: 'The Great Gatsby is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        pageCount: 218,
        publisher: 'F. Scott Fitzgerald',
        publishedDate: 'October 15, 1925',
        addToLibrary: false,
        rating: 1
    },
    {
        id: '2',
        isbn: '9780061120084',
        title: '1984',
        author: 'George Orwell',
        summary: 'A dystopian novel about a totalitarian society.',
        excerpt: 'A dystopian novel about a totalitarian society.',
        genres: 'Fiction,Dystopian,Science Fiction,Horror,Adventure,Tragedy',
        notes: '1984 is a dystopian novel about a totalitarian society. I like it. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society.',
        pageCount: 328,
        publisher: 'George Orwell',
        publishedDate: 'October 15, 1949',
        image: 'https://m.media-amazon.com/images/I/7180qjGSgDL._SL1360_.jpg',
        addToLibrary: false,
        rating: 1
    },

    {
        id: '3',
        isbn: '9780333791035',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        genres: 'Fiction,History,Classic,Drama,Romance,Adventure,Tragedy',
        notes: 'The Great Gatsby is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        pageCount: 218,
        publisher: 'F. Scott Fitzgerald',
        publishedDate: 'October 15, 1925',
        addToLibrary: false,
        rating: 1
    },
    {
        id: '4',
        isbn: '9780061120084',
        title: '1984',
        author: 'George Orwell',
        summary: 'A dystopian novel about a totalitarian society.',
        excerpt: 'A dystopian novel about a totalitarian society.',
        genres: 'Fiction,Dystopian,Science Fiction,Horror,Adventure,Tragedy',
        notes: '1984 is a dystopian novel about a totalitarian society. I like it. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society.',
        pageCount: 328,
        publisher: 'George Orwell',
        publishedDate: 'October 15, 1949',
        image: 'https://m.media-amazon.com/images/I/7180qjGSgDL._SL1360_.jpg',
        addToLibrary: false,
        rating: 1
    },

    {
        id: '5',
        isbn: '9780333791035',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        genres: 'Fiction,History,Classic,Drama,Romance,Adventure,Tragedy',
        notes: 'The Great Gatsby is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream. It is a classic novel about the American dream.',
        pageCount: 218,
        publisher: 'F. Scott Fitzgerald',
        publishedDate: 'October 15, 1925',
        addToLibrary: false,
        rating: 1
    },
    {
        id: '6',
        isbn: '9780061120084',
        title: '1984',
        author: 'George Orwell',
        summary: 'A dystopian novel about a totalitarian society.',
        excerpt: 'A dystopian novel about a totalitarian society.',
        genres: 'Fiction,Dystopian,Science Fiction,Horror,Adventure,Tragedy',
        notes: '1984 is a dystopian novel about a totalitarian society. I like it. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society. It is a dystopian novel about a totalitarian society.',
        pageCount: 328,
        publisher: 'George Orwell',
        publishedDate: 'October 15, 1949',
        image: 'https://m.media-amazon.com/images/I/7180qjGSgDL._SL1360_.jpg',
        addToLibrary: false,
        rating: 1
    },

];

const defaultSelectableBooks: SelectableBook[] = defaultBooks.map((currentBook) => ({ book: currentBook, isSelected: false }));

const size = 36;
const Recommendations: React.FC = () => {
    // State to keep track of books and their favorite status
    const [books, setBooks] = useState<Book[]>(defaultBooks);
    const [selectableBooks, setSelectableBooks] = useState<SelectableBook[]>(defaultSelectableBooks);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);

    // function to check if any books are selected
    const areAnyBooksSelected = () => {
        return selectableBooks.some((book) => book.isSelected);
    };

    // function to get all selected book ids
    const getAllSelectedBookIds = () => {
        return selectableBooks
            .filter((book) => book.isSelected)
            .map((book) => book.book.id);
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
                            setBooks(resultWithAddedBooks);
                            setSelectableBooks(resultWithAddedBooks.map((book) => ({ book, isSelected: false })));
                        }
                    }
                    // setting if initial books is not empty 
                    else {
                        setBooks(initialBooks);
                        setSelectableBooks(initialBooks.map((book) => ({ book, isSelected: false })));
                    }

                    // setting categories
                    const initialCategories = await getAllCategories();
                    if (Array.isArray(initialCategories)) {
                        setCategories(initialCategories.map((category) => category.name));
                    }

                }
            } catch (error) {
                console.error("Failed to load books:", error);
            }
        };

        fetchBooksAndCategories();
    }, []);

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    // will change the state of the book to add to library
    const handleAddToLibraryPress = async (bookId: string) => {
        // getting recommended book from db
        const recommendedBook = await getRecommendedBookById(bookId);
        if (!recommendedBook) {
            console.error("Failed to get recommended book");
            return;
        }

        // update recommended book in db
        const updatedBook = { ...recommendedBook, addToLibrary: !recommendedBook.addToLibrary };
        const result = await updateRecommendedBook(updatedBook);
        if (!result) {
            console.error("Failed to update recommended book");
            return;
        }

        // update local book state after updating db
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.id === bookId
                    ? { ...book, addToLibrary: !book.addToLibrary } // Toggle added to library status
                    : book
            )
        );
        // update local selectable book state after updating db
        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) =>
                currentSelectableBook.book.id === bookId
                    ? { ...currentSelectableBook, book: { ...currentSelectableBook.book, addToLibrary: !currentSelectableBook.book.addToLibrary } } // Toggle added to library status
                    : currentSelectableBook
            )
        );

    };

    const toggleSelectedBook = (bookId: string) => {
        console.log(`Toggling selected book: ${bookId}`);
        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) =>
                currentSelectableBook.book.id === bookId
                    ? { ...currentSelectableBook, isSelected: !currentSelectableBook.isSelected } // Toggle selected status
                    : currentSelectableBook
            )
        );

    };

    // set all books to be deselected
    const deselectAllBooks = () => {
        setSelectableBooks((prevSelectableBooks) =>
            prevSelectableBooks.map((currentSelectableBook) => ({ ...currentSelectableBook, isSelected: false }))
        );
    };

    // book add button to be passed as a prop to the book previews
    const renderBookButton = (currentSelectableBook: SelectableBook) => (
        <Pressable onPress={() => handleAddToLibraryPress(currentSelectableBook.book.id)} className="ml-4">
            <AddButtonIcon isAdded={currentSelectableBook.book.addToLibrary || false} />
        </Pressable>
    );

    // if the string typed in the search bar is a part of a book title, isbn, or author then render the book
    const renderItem = ({ item }: { item: SelectableBook }) => {
        if (search === "" || item.book.title.toLowerCase().includes(search.toLowerCase()) || item.book.author.toLowerCase().includes(search.toLowerCase()) || item.book.isbn?.toLowerCase().includes(search)) {
            return (
                <BookPreview
                    book={item.book}
                    button={renderBookButton(item)}
                    isRecommendation={true}
                    toggleSelected={toggleSelectedBook}
                    selectedBooks={getAllSelectedBookIds()}
                />
            )
        }
        return (null);
    }

    return (
        <SafeAreaView className="flex-1">
            <SearchBar placeholder="Search by title, ISBN, or author..." onChangeText={updateSearch} value={search} />
            <View className='flex-1'>
                <FlatList
                    data={selectableBooks}
                    keyExtractor={(item) => item.book.id}
                    renderItem={renderItem}
                />
            </View>

            {areAnyBooksSelected() && (

                <View className="flex-row justify-around bg-[#161f2b] w-full border-t border-blue-500">
                    <View className="">
                        <Pressable className="flex-col items-center" onPress={() => { console.log("delete") }}>
                            <DeleteIcon height={size} width={size} />
                            <Text className="text-white text-sm">Delete </Text>
                        </Pressable>
                    </View>

                    <View>
                        <Pressable className="flex-col items-center" onPress={() => { console.log("rename") }}>
                            <AddSquareIcon height={size} width={size} />
                            <Text className="text-white text-sm">Add</Text>
                        </Pressable>
                    </View>

                    <View>
                        <Pressable className="flex-col items-center" onPress={() => { console.log("cancel") }}>
                            <CancelIcon height={size} width={size} />
                            <Text className="text-white text-sm">Cancel</Text>

                        </Pressable>
                    </View>

                </View>

            )}
        </SafeAreaView>
    );
};

export default Recommendations;
