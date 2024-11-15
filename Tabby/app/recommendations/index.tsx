import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import BookPreview from '@/components/BookPreview'; // Adjust the path as necessary
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButtonIcon from '@/components/AddButtonIcon';
import { SearchBar } from "@rneui/themed";
type Book = {
    isbn: string;
    title: string;
    author: string;
    summary: string;
    excerpt: string;
    image: string;
    isAddedToLibrary: boolean;
};

// test data to see how the recconmendation page would look
const initialBooks: Book[] = [
    {
        isbn: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isAddedToLibrary: true,
    },
    {
        isbn: '2',
        title: '1984',
        author: 'George Orwell',
        summary: 'A dystopian novel about a totalitarian society.',
        excerpt: 'A dystopian novel about a totalitarian society.',
        image: 'https://m.media-amazon.com/images/I/7180qjGSgDL._SL1360_.jpg',
        isAddedToLibrary: false,
    },


];

const Reccomendations: React.FC = () => {
    // State to keep track of books and their favorite status
    const [books, setBooks] = useState<Book[]>(initialBooks);
    const [search, setSearch] = useState("");

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    // will change the state of the book to add to library
    const handleAddToLibraryPress = (bookId: string) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.isbn === bookId
                    ? { ...book, isAddedToLibrary: !book.isAddedToLibrary } // Toggle added to library status
                    : book
            )
        );
    };

    // book add button to be passed as a prop to the book previews
    const renderBookButton = (book: { isbn: string; isAddedToLibrary: boolean }) => (
        <Pressable onPress={() => handleAddToLibraryPress(book.isbn)} className="ml-4">
            <AddButtonIcon isAdded={book.isAddedToLibrary} />
        </Pressable>
    );

    // if the string typed in the search bar is a part of a book title then render the book
    const renderItem = ({ item }: { item: Book }) => {
        if (search === "" || item.title.toLowerCase().includes(search.toLowerCase())) {
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(item)}
                    isReccommendation={true}
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
                keyExtractor={(item) => item.isbn}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default Reccomendations;
