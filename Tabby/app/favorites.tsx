import BookPreview from '@/components/BookPreview';
import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, View, Text } from 'react-native';
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
        const trimmedSearch = search.trim();
        const genresAsArray = item.genres?.split(",") || [];
        const searchAsLowerCase = trimmedSearch.toLowerCase();
        const filteredStringWithOnlyNumbers = trimmedSearch.replace(/\D/g, '');

        if (item.isFavorite && (search === "" || item.title.toLowerCase().includes(searchAsLowerCase) || item.author.toLowerCase().includes(searchAsLowerCase) || genresAsArray.some((genre) => genre.toLowerCase().includes(searchAsLowerCase)
            || item.isbn === filteredStringWithOnlyNumbers))) {
            return (

                <View>
                    <Text className='text-left text-white font-bold text-lg pl-5 -mb-2'>{item.category}</Text>
                    <BookPreview
                        book={item}
                        button={renderBookButton(item)}
                    />
                </View>

            )
        }
        return (null);
    }

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    return (
        <SafeAreaView className="flex-1">
            <SearchBar placeholder="Search by title, author, genre, or isbn" onChangeText={updateSearch} value={search} />
            {(books && books.length === 0) &&
                (<View className='flex-1 justify-center items-center'>
                    <Text className="text-white text-center text-xl">No Favorite Books ...</Text>
                </View>)
            }

            <FlatList
                className="pt-1"
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

export default Favorites;
