import { useState, useEffect } from 'react';
import { FlatList, Pressable, Modal, TextInput, View, Text } from 'react-native';
import BookPreview from '@/components/BookPreview';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import { SearchBar } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';
import { getAllUserBooksByCategory, addUserBook, updateUserBook, getUserBookById } from "@/database/databaseOperations";
import { Book } from "@/types/book";

const defaultBooks: Book[] = [
    {
        id: 'default',
        title: '',
        author: '',
        summary: '',
        excerpt: '',
        image: '',
        rating: 1,
        genres: '',
        isFavorite: false
    }
]

const CategoryPage: React.FC = () => {
    const { category } = useLocalSearchParams();
    console.log("Category:", category);
    const [books, setBooks] = useState<Book[]>(defaultBooks);

    // will fetch books from database on mount
    useEffect(() => {
        const fetchingBooksFromCategory = async () => {
            try {
                if (!category) {
                    throw new Error("No category found");
                }
                const initialBooks = await getAllUserBooksByCategory(category as string);
                // check if initialBooks is an array of books
                if (Array.isArray(initialBooks)) {
                    setBooks(initialBooks);
                }

            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };

        fetchingBooksFromCategory();
    }, []);




    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [newCustomBook, setNewCustomBook] = useState({
        title: '',
        author: '',
        summary: '',
        excerpt: '',
        notes: '',
        pageCount: 0,

    });

    const handleFavoritePress = async (bookId: string) => {
        // get user book by id
        const userBook = await getUserBookById(bookId);
        if (!userBook) {
            console.error("Failed to get user book");
            return;
        }
        console.log("**page** User book: ", userBook), "**page**";
        // update user book
        const updatedUserBook = { ...userBook, isFavorite: !userBook.isFavorite };
        console.log("**page** Updated user book: ", updatedUserBook), "**page**";

        const resultOfUpdatingUserBook = await updateUserBook(updatedUserBook);
        if (!resultOfUpdatingUserBook) {
            console.error("Failed to update user book");
            return;
        }

        setBooks((prevBooks) =>
            prevBooks?.map((book) =>
                book.id === bookId
                    ? { ...book, isFavorite: !book.isFavorite }
                    : book
            )
        );
    };

    const renderBookButton = (book: { id: string; isFavorite: boolean }) => (
        <Pressable onPress={() => handleFavoritePress(book.id)} className="ml-4">
            <FavoriteButtonIcon isFavorite={book.isFavorite} />
        </Pressable>
    );

    const renderItem = ({ item }: { item: Book }) => {
        // check if book array has the default book if it does do not render anything meaning category has no books yet
        if (item.id === "default") {
            return (null);
        }
        if (search === "" || item.title.toLowerCase().includes(search.toLowerCase())) {
            const partialBookObj = { id: item.id, isFavorite: item.isFavorite || false };
            return (
                <BookPreview
                    book={item}
                    button={renderBookButton(partialBookObj)}
                />
            );
        }
        return (null);
    };

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    const handleAddCustomBook = async () => {
        const newCustomBookDataThatWillBeAdded: Book = {
            id: (books.length + 1).toString(),
            title: newCustomBook.title,
            author: newCustomBook.author,
            summary: newCustomBook.summary,
            excerpt: newCustomBook.excerpt,
            image: "",
            rating: 1,
            pageCount: newCustomBook.pageCount,
            notes: newCustomBook.notes,
            genres: "",
            category: category as string,
            isFavorite: false,
            isCustomBook: true
        };
        const resultOfAddingCustomBook = await addUserBook(newCustomBookDataThatWillBeAdded);
        if (!resultOfAddingCustomBook) {
            console.error("Failed to add custom book");
            return;
        }
        // add new book to books has to be done after adding to database as the book object that is returned from database has the proper uuid
        setBooks([...books, resultOfAddingCustomBook]);
        // reset new custom book state
        setNewCustomBook({ title: '', author: '', summary: '', excerpt: '', notes: '', pageCount: 0 });
        // closing modal
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 p-4">
            <SearchBar placeholder="Search by title, ISBN, or author..." onChangeText={updateSearch} value={search} />
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <Pressable onPress={() => setModalVisible(true)} className="p-2 bg-blue-500 rounded mt-4">
                <Text className="text-white text-center">Add Custom Book</Text>
            </Pressable>

            {/* Modal for adding custom book */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-4/5 p-6 bg-white rounded-lg">
                        <Text className="text-lg font-medium mb-2">Add Title</Text>
                        <TextInput
                            placeholder="Title"
                            value={newCustomBook.title}
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, title: text })}
                            className="border-b border-gray-300 mb-4"
                        />

                        <Text className="text-lg font-medium mb-2">Add Author</Text>
                        <TextInput
                            placeholder="Author"
                            value={newCustomBook.author}
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, author: text })}
                            className="border-b border-gray-300 mb-4"
                        />

                        <Text className="text-lg font-medium mb-2">Add Summary</Text>
                        <TextInput
                            placeholder="Summary"
                            value={newCustomBook.summary}
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, summary: text })}
                            className="border-b border-gray-300 mb-4"
                        />

                        <Text className="text-lg font-medium mb-2"> Add Excerpt</Text>
                        <TextInput
                            placeholder="Excerpt"
                            value={newCustomBook.excerpt}
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, excerpt: text })}
                            className="border-b border-gray-300 mb-4"
                        />

                        <Text className="text-lg font-medium mb-2"> Add Notes</Text>
                        <TextInput
                            placeholder="Notes"
                            value={newCustomBook.notes}
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, notes: text })}
                            className="border-b border-gray-300 mb-4"
                        />

                        <Text className="text-lg font-medium mb-2">Add Page Count</Text>
                        <TextInput
                            placeholder="Page Count"
                            onChangeText={(text) => setNewCustomBook({ ...newCustomBook, pageCount: parseInt(text) })}
                            keyboardType="numeric"
                            className="border-b border-gray-300 mb-4"
                        />

                        <Pressable className="mt-4 bg-blue-500 rounded p-2" onPress={handleAddCustomBook} >
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
