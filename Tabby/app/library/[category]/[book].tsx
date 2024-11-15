import { View, Pressable, Text, ScrollView, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import BookCard from '@/components/book/BookCard';
import ScrollableGenres from '@/components/book/ScrollableGenres';
import { Book } from "@/types/book";
import { useState } from 'react';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import MenuIcon from '@/components/book/MenuIcon';
import DropdownMenu from '@/components/book/DropDownMenu';
import DeleteIcon from "@/assets/categories/delete-icon.svg";
import DeleteBookModal from '@/components/book/DeleteBookModal';
import { http_callback } from '@/types/api_request';
import { catchErrorTyped } from '@/types/error_handle';

const BookPage = () => {
    const [favorite, setFavorite] = useState(false);
    const [isMoveMenuVisible, setIsMoveMenuVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // test book data to see how the book page will look with all its components
    const BookObj: Book = {
        isbn: '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        excerpt: 'A novel about racial injustice and racial segregation.',
        summary: 'Set in the racially segregated South of the 1930s, To Kill a Mockingbird follows young Scout Finch as she observes her father, Atticus, defend Tom Robinson, a Black man falsely accused of rape. Through Scout’s eyes, the story explores racism, justice, empathy, and moral courage in a deeply divided community.',
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: favorite,
        addToLibrary: false,
        genres: "Fiction,Dystopian,Mystery,Sci-Fi,Non-Fiction",
        rating: 4,
        pageCount: 281,
        publisher: "Scribner",
        publishedDate: "November 19, 1960"
    }

    const genresAsArray = BookObj.genres?.split(",") || [""];

    const handleMoveToCategory = async (category: string) => {
        console.log(`Moving book to category: ${category}`);

        // DEBUG: Currently invalid due to this being local host.
        // Will have to use a public address so that it can be used in android studios
        const [error, value] = await catchErrorTyped(http_callback({
            domain: process.env.EXPO_PUBLIC_API_URL || "",
            route: "members",
            method: "GET",
            type: "application/json"
        })
        );

        if (error) {
            console.log("Error Found ", error.message);
        } else {
            console.log(value);
        }
    };

    const handleDeleteBook = () => {
        setIsDeleteModalVisible(false);
        console.log(`Deleting ${book} from ${category}`);
    };

    // Extract both category and book slugs
    const { category, book } = useLocalSearchParams();

    console.log(book, "is from", category);

    const otherData = [`Pages ${BookObj.pageCount}`, `Published by ${BookObj.publisher}`, `First Published ${BookObj.publishedDate}`];

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



                    <Pressable onPress={() => setFavorite(!favorite)} className=" p-1 mr-2">
                        <FavoriteButtonIcon isFavorite={favorite} StrokeColor='white' />
                    </Pressable>

                    <Pressable onPress={() => setIsMoveMenuVisible(!isMoveMenuVisible)} className="p-1 mr-2" >

                        <MenuIcon isSelected={isMoveMenuVisible} />
                    </Pressable>
                    {/* Custom DropdownMenu */}
                    <DropdownMenu
                        visible={isMoveMenuVisible}
                        items={genresAsArray}
                        onSelect={handleMoveToCategory}
                        onClose={() => setIsMoveMenuVisible(false)}
                        heading={"Move To Category"}
                    />
                </View>



                <View>
                    <BookCard book={BookObj} />
                </View>

                <View className="pl-1 pt-5">
                    <ScrollableGenres genres={genresAsArray} />
                </View>


                <FlatList
                    className='pt-5'
                    data={otherData}
                    horizontal
                    keyExtractor={(item, index) => (index.toString() + item)}
                    renderItem={({ item }) => (
                        <View className='rounded-lg mr-2 border border-white px-4 justify-center items-center h-7'>
                            <Text className="text-white text-sm">{item}</Text>
                        </View>

                    )}
                    showsHorizontalScrollIndicator={false}
                />



                <View className="pl-5 pt-5 flex justify-center">
                    <Text className='text-lg text-white'> My Notes</Text>

                    <ScrollView className="max-h-40 pl-1">
                        <Text className='text-sm text-white max-w-sm text-start'>To Kill a Mockingbird by Harper Lee is a powerful novel set in the 1930s Southern United States, tackling themes of racial injustice, empathy, and moral courage through the perspective of Scout Finch, a young girl witnessing her father, Atticus Finch, defend Tom Robinson, a Black man falsely accused of rape. The story presents a nuanced view of a racially divided community and emphasizes the importance of standing up for justice, even when the odds are against you. Rated 4 stars, this book combines elements of fiction, mystery, and dystopian genres and has remained relevant since its publication in 1960 by Scribner. With 281 pages, it’s a reflective, thought-provoking read that has solidified its place as a classic in American literature. The cover image evokes a somber, contemplative mood, fitting for a story of courage amidst adversity.</Text>
                    </ScrollView>
                </View>



            </SafeAreaView>


        </>


    )
}

export default BookPage