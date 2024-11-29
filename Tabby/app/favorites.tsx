import BookPreview from '@/components/BookPreview';
import React, { useState, useEffect } from 'react';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import { SearchBar } from '@rneui/themed';
import { Book } from "@/types/book";
import { getAllFavoriteUserBooks, updateUserBook } from '@/database/databaseOperations'

// page to display pinned categories and books needs to be built
const Favorites = () => {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [search, setSearch] = useState("");

    const fetchFavoriteBooks = async () => {
        const fetchedFavoriteBooks = await getAllFavoriteUserBooks()
        setBooks(fetchedFavoriteBooks);
    }

    useEffect(() => {
        fetchFavoriteBooks();
    }, [])

    // TODO: favorite button under category page doesnt update 
    //       only when going from favorite to non-favorite
    const handleFavoritePress = async (currentBook: Book) => {
        const updatedBook = { ...currentBook, isFavorite: !currentBook.isFavorite };
        await updateUserBook(updatedBook);
        fetchFavoriteBooks();
    };

    // book heart button to be passed as a prop to the book previews
    const renderBookButton = (book: Book) => {
        const isFavorite = book.isFavorite || false
        return (
            <Pressable testID="heartButton" onPress={() => handleFavoritePress(book)} className="ml-4">
                <FavoriteButtonIcon isFavorite={isFavorite} />
            </Pressable>
        )
    }

    const renderItem = ({ item }: { item: Book }) => {
        if (item.isFavorite && (search === "" || item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()) || item.isbn?.toLowerCase().includes(search))) {
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
        <SafeAreaView className="flex-1">
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
