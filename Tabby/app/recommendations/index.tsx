import React, { useState, useEffect } from 'react';
import { FlatList, Pressable } from 'react-native';
import BookPreview from '@/components/BookPreview'; // Adjust the path as necessary
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButtonIcon from '@/components/AddButtonIcon';
import { SearchBar } from "@rneui/themed";
import { getAllCategories, getAllRecommendedBooks, addRecommendedBook, deleteRecommendedBookById, updateRecommendedBook, getRecommendedBookById } from "@/database/databaseOperations";
import { Book } from "@/types/book";

// test data to see how the recommendation page would look
const defaultBooks: Book[] = [
    {
        id: '1',
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
    },
    {
        id: '2',
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
    },


];

const Recommendations: React.FC = () => {
    // State to keep track of books and their favorite status
    const [books, setBooks] = useState<Book[]>(defaultBooks);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);

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
                        }
                    }
                    // setting if initial books is not empty
                    else {
                        setBooks(initialBooks);
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
    };

    // book add button to be passed as a prop to the book previews
    const renderBookButton = (book: { id: string; isAddedToLibrary: boolean }) => (
        <Pressable onPress={() => handleAddToLibraryPress(book.id)} className="ml-4">
            <AddButtonIcon isAdded={book.isAddedToLibrary} />
        </Pressable>
    );

    // if the string typed in the search bar is a part of a book title then render the book
    const renderItem = ({ item }: { item: Book }) => {
        console.log("render: ", item);
        if (search === "" || item.title.toLowerCase().includes(search.toLowerCase())) {

            const partialBookObj = { id: item.id, isAddedToLibrary: item.addToLibrary || false };
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(partialBookObj)}
                    isRecommendation={true}
                />
            )
        }
        return (null);
    }

    return (
        <SafeAreaView className="flex-1 p-4">
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search} />
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default Recommendations;
