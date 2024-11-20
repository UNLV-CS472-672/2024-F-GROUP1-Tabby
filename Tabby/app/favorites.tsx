import BookPreview from '@/components/BookPreview';
import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import { SearchBar } from '@rneui/themed';
import { Book } from "@/types/book";
const initialBooks: Book[] = [
    {
        id: '1',
        isbn: '9780333791035',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },
    {
        id: '2',
        title: 'To Kill a Mockingbird',
        isbn: '9780061120084',
        author: 'Harper Lee',
        excerpt: 'A novel about racism and injustice.',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },
    // Add more book objects as needed

    {
        id: '3',
        title: 'The Great Gatsby',
        isbn: '9780333791035',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },
    {
        id: '4',
        isbn: '9780061120084',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        excerpt: 'A novel about racism and injustice.',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },

    {
        id: '5',
        isbn: '9780333791035',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },

];

// page to display pinned categories and books needs to be built
const Favorites = () => {

    const [books, setBooks] = useState<Book[]>(initialBooks);
    const [search, setSearch] = useState("");

    const handleFavoritePress = (bookId: string) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.id === bookId
                    ? { ...book, isFavorite: !book.isFavorite } // Toggle favorite status
                    : book
            )
        );
    };

    // book heart button to be passed as a prop to the book previews
    const renderBookButton = (book: { id: string; isFavorite: boolean }) => (
        <Pressable testID="heartButton" onPress={() => handleFavoritePress(book.id)} className="ml-4">
            <FavoriteButtonIcon isFavorite={book.isFavorite} />
        </Pressable>
    );

    const renderItem = ({ item }: { item: Book }) => {
        if (item.isFavorite && (search === "" || item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()) || item.isbn?.toLowerCase().includes(search))) {
            const partialBookObj = { id: item.id, isFavorite: item.isFavorite || false };
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(partialBookObj)}
                />
            )
        }
        return (null);
    }

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    return (
        <SafeAreaView className="flex-1 p-4">
            <SearchBar placeholder="Search by title, ISBN, or author..." onChangeText={updateSearch} value={search} />
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default Favorites;
