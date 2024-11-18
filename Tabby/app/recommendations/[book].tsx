import { View, Pressable, Text, ScrollView, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import BookCard from '@/components/book/BookCard';
import ScrollableHorizontalList from '@/components/book/ScrollableHorizontalList';
import { Book } from "@/types/book";
import { useEffect, useState } from 'react';
import AddButtonIcon from '@/components/AddButtonIcon';
import MenuIcon from '@/components/book/MenuIcon';
import DropdownMenu from '@/components/book/DropDownMenu';
import DeleteIcon from "@/assets/categories/delete-icon.svg";
import DeleteBookModal from '@/components/book/DeleteBookModal';

import { getRecommendedBookById, deleteRecommendedBookById, updateRecommendedBook, getAllCategories, addUserBook } from '@/database/databaseOperations';
import { useRouter } from "expo-router";


const BookPage = () => {
    const router = useRouter();
    const [isMoveMenuVisible, setIsMoveMenuVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book>({ id: "default", title: "", author: "", excerpt: "", summary: "", image: "", addToLibrary: false });
    const [categories, setCategories] = useState<string[]>([]);

    // Extract both category and book slugs
    const { category, book } = useLocalSearchParams();

    console.log(book, "is from", category);

    // get book data from database
    useEffect(() => {
        const fetchBookDataAndCategories = async () => {
            try {
                const bookResponse = await getRecommendedBookById(book as string);
                const categoriesResponse = await getAllCategories();

                console.log(bookResponse);
                console.log(categoriesResponse);
                // set current book if not empty
                if (bookResponse) {
                    setCurrentBook(bookResponse);
                }
                // set categories if not empty
                if (categoriesResponse) {
                    setCategories(categoriesResponse.map((currentCategory) => (currentCategory.name)));
                }
            } catch (error) {
                console.error("Error fetching book data:", error);
            }
        }

        fetchBookDataAndCategories();

    }, []);

    const genresAsArray = currentBook.genres?.split(",") || [];
    const otherData = [`Pages ${currentBook?.pageCount || "Unknown"}`, `Published by ${currentBook?.publisher || "Unknown"}`, `First Published ${currentBook?.publishedDate || "Unknown"}`];

    const handleAddToCategory = async (addToThisCategory: string) => {
        console.log(`Moving book to category: ${addToThisCategory}`);
        // updating book to be added to library and category for user books 
        const updatedBook = { ...currentBook, addToLibrary: true, category: addToThisCategory };
        const result = await addUserBook(updatedBook);
        if (!result) {
            console.error("Failed to add user book");
            return;
        }
        setCurrentBook(updatedBook);
    };

    const handleAddToLibrary = async () => {
        const updatedBook = { ...currentBook, addToLibrary: !currentBook.addToLibrary };
        const result = await updateRecommendedBook(updatedBook);
        if (!result) {
            console.error("Failed to update recommended book");
            return;
        }
        setCurrentBook(updatedBook);

    }

    const handleDeleteBook = async () => {
        setIsDeleteModalVisible(false);
        console.log(`Deleting ${book} from ${category}`);
        // deleting book from db 
        await deleteRecommendedBookById(book as string);
        router.push("/recommendations");

    };




    return (
        <>
            <SafeAreaView>

                <View className='flex-row justify-end items-center'>

                    <Pressable className="p-1 mr-2" onPress={() => setIsDeleteModalVisible(!isDeleteModalVisible)} >
                        <DeleteIcon width={40} height={40} />
                    </Pressable>

                    {/* Delete Modal */}

                    <DeleteBookModal
                        visible={isDeleteModalVisible}
                        onClose={() => setIsDeleteModalVisible(false)}
                        onConfirm={handleDeleteBook}
                    />



                    <Pressable onPress={() => handleAddToLibrary()} className=" p-1 mr-2">
                        <AddButtonIcon isAdded={currentBook.addToLibrary || false} />
                    </Pressable>

                    <Pressable onPress={() => setIsMoveMenuVisible(!isMoveMenuVisible)} className="p-1 mr-2" >

                        <MenuIcon isSelected={isMoveMenuVisible} />
                    </Pressable>
                    {/* Custom DropdownMenu */}
                    <DropdownMenu
                        visible={isMoveMenuVisible}
                        items={categories}
                        onSelect={handleAddToCategory}
                        onClose={() => setIsMoveMenuVisible(false)}
                        heading={"Add To Category"}
                    />
                </View>



                <View>
                    <BookCard book={currentBook} />
                </View>

                {genresAsArray.length > 0 && <View className="pl-1 pt-5">
                    <ScrollableHorizontalList listOfStrings={genresAsArray} />
                </View>}

                <View className="pl-1 pt-5">
                    <ScrollableHorizontalList listOfStrings={otherData} />
                </View>





                <View className="pl-5 pt-5 flex justify-center">
                    <Text className='text-lg text-white'> My Notes</Text>

                    <ScrollView className="max-h-40 pl-1">
                        <Text className='text-sm text-white max-w-sm text-start'>{currentBook.notes}</Text>
                    </ScrollView>
                </View>



            </SafeAreaView>


        </>


    )
}

export default BookPage