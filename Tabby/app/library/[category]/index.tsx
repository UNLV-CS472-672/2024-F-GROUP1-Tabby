import React, { useState } from 'react';
import { FlatList, Pressable, Modal, TextInput, Button, View, Text, Image } from 'react-native';
import BookPreview from '@/components/BookPreview';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import { SearchBar } from '@rneui/themed';

type Book = {
    isbn: string;
    title: string;
    author: string;
    summary: string;
    excerpt: string;
    image: string;
    isFavorite: boolean;
};

const defaultImage = require('@/assets/book/default-book-cover.jpg');

const initialBooks: Book[] = [
    {
        isbn: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
        isFavorite: false,
    },
    {
        isbn: '2',
        title: 'Test Book',
        author: 'F. Scott Fitzgerald',
        summary: 'A novel about the American dream.',
        excerpt: 'A novel about the American dream.',
        image: "",
        isFavorite: false,
    },
    // Add more initial books as needed
];


const CategoryPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>(initialBooks);
    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        summary: '',
        excerpt: ''
    });

    const handleFavoritePress = (bookId: string) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) =>
                book.isbn === bookId
                    ? { ...book, isFavorite: !book.isFavorite }
                    : book
            )
        );
    };

    const renderBookButton = (book: { isbn: string; isFavorite: boolean }) => (
        <Pressable onPress={() => handleFavoritePress(book.isbn)} className="ml-4">
            <FavoriteButtonIcon isFavorite={book.isFavorite} />
        </Pressable>
    );

    const renderItem = ({ item }: { item: Book }) => {
        if (search === "" || item.title.toLowerCase().includes(search.toLowerCase())) {
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(item)}
                />
            );
        }
        return null;
    };

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    const handleAddBook = () => {
        const newBookData: Book = {
            isbn: (books.length + 1).toString(),
            title: newBook.title,
            author: newBook.author,
            summary: newBook.summary,
            excerpt: newBook.excerpt,
            image: "",
            isFavorite: false
        };
        setBooks([...books, newBookData]);
        setNewBook({ title: '', author: '', summary: '', excerpt: '' });
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 p-4">
            {/* <Image source={require('@/assets/book/default-book-cover.jpg')}></Image> */}
            <SearchBar placeholder="Type Here..." onChangeText={updateSearch} value={search} />
            <FlatList
                data={books}
                keyExtractor={(item) => item.isbn}
                renderItem={renderItem}
            />
            <Pressable onPress={() => setModalVisible(true)} className="p-2 bg-blue-500 rounded mt-4">
                <Text className="text-white text-center">Add Book</Text>
            </Pressable>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-4/5 p-6 bg-white rounded-lg">
                        <TextInput
                            placeholder="Title"
                            value={newBook.title}
                            onChangeText={(text) => setNewBook({ ...newBook, title: text })}
                            className="border-b border-gray-300 mb-4"
                        />
                        <TextInput
                            placeholder="Author"
                            value={newBook.author}
                            onChangeText={(text) => setNewBook({ ...newBook, author: text })}
                            className="border-b border-gray-300 mb-4"
                        />
                        <TextInput
                            placeholder="Summary"
                            value={newBook.summary}
                            onChangeText={(text) => setNewBook({ ...newBook, summary: text })}
                            className="border-b border-gray-300 mb-4"
                        />
                        <TextInput
                            placeholder="Excerpt"
                            value={newBook.excerpt}
                            onChangeText={(text) => setNewBook({ ...newBook, excerpt: text })}
                            className="border-b border-gray-300 mb-4"
                        />
                        <Pressable className="mt-4 bg-blue-500 rounded p-2" onPress={handleAddBook} >
                            <Text className="text-white text-center">Confirm</Text>

                        </Pressable>
                        <Pressable className="mt-4 bg-red-500 rounded p-2" onPress={() => setModalVisible(false)} >
                            <Text className="text-white text-center">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CategoryPage;
