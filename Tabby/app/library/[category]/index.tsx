import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import BookCard from '@/components/BookCard'; // Adjust the path as necessary
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon'; // Assuming you have a custom favorite button component
import { SearchBar } from '@rneui/themed';

type Book = {
    id: string;
    title: string;
    author: string;
    summary: string;
    image: string;
    isFavorite: boolean;
};

const initialBooks: Book[] = [
    {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },
    {
        id: '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        summary: 'A novel about racism and injustice.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: true,
    },
    // Add more book objects as needed
];

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

    const renderBookButton = (book: { id: string; isFavorite: boolean }) => (
        <Pressable onPress={() => handleFavoritePress(book.id)} className="ml-4">
            <FavoriteButtonIcon isFavorite={book.isFavorite} />
        </Pressable>
    );

    const updateSearch = (search) => {
        setSearch(search);
      };

    return (
        <SafeAreaView className="flex-1 p-4">
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search}/>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BookCard
                        book={item}
                        button={renderBookButton(item)} // Passing the Pressable button as a prop
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default CategoryPage;
