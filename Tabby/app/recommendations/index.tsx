import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import BookCard from '@/components/BookCard'; // Adjust the path as necessary
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButtonIcon from '@/components/AddButtonIcon';
import { SearchBar } from "@rneui/themed";
type Book = {
    id: string;
    title: string;
    author: string;
    summary: string;
    image: string;
    isAddedToLibrary: boolean;
};

const initialBooks: Book[] = [
    {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isAddedToLibrary: false,
    },
    {
        id: '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
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

    const handleAddToLibraryPress = (bookId: string) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.id === bookId
                    ? { ...book, isAddedToLibrary: !book.isAddedToLibrary } // Toggle favorite status
                    : book
            )
        );
    };

    const renderBookButton = (book: { id: string; isAddedToLibrary: boolean }) => (
        <Pressable onPress={() => handleAddToLibraryPress(book.id)} className="ml-4">
            <AddButtonIcon isAdded={book.isAddedToLibrary} />
        </Pressable>
    );

    // if the string typed in the search bar is a part of a book title then render the book
    const renderItem = ({item}: {item: Book}) => {
        if(search == "" || item.title.toLowerCase().includes(search.toLowerCase())){
            return (
                <BookCard  
                    book={item}
                    button={renderBookButton(item)}
                />
            )
        }
        return(null);
    }

    return (
        <SafeAreaView className="flex-1 p-4">
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search}/>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default Reccomendations;
