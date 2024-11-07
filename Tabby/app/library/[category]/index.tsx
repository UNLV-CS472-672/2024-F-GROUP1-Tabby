import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import BookPreview from '@/components/BookPreview';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon'; // Assuming you have a custom favorite button component
import { SearchBar } from '@rneui/themed';

type Book = {
    id: string;
    title: string;
    author: string;
    summary: string;
    excerpt: string;
    image: string;
    isFavorite: boolean;
};

const initialBooks: Book[] = [
    {
        id: '1',
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
        author: 'Harper Lee',
        excerpt: 'A novel about racism and injustice.',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },
    // Add more book objects as needed

    {
        id: '3',
        title: 'The Great',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },
    {
        id: '4',
        title: 'To Kill',
        author: 'Harper Lee',
        excerpt: 'A novel about racism and injustice.',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },

    {
        id: '5',
        title: 'The',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },

];

// to set book as favorite
const CategoryPage: React.FC = () => {
    // State to keep track of books and their favorite status
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
        <Pressable onPress={() => handleFavoritePress(book.id)} className="ml-4">
            <FavoriteButtonIcon isFavorite={book.isFavorite} />
        </Pressable>
    );

    // if the string typed in the search bar is a part of a book title then render the book
    const renderItem = ({ item }: { item: Book }) => {
        if (search === "" || item.title.toLowerCase().includes(search.toLowerCase())) {
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(item)}
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
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search} />
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default CategoryPage;
