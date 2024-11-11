import { View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import BookCard from '@/components/book/BookCard';
import ScrollableGenres from '@/components/book/ScrollableGenres';
import { Book } from "@/types/book";
import { useState } from 'react';
import FavoriteButtonIcon from '@/components/FavoriteButtonIcon';
import DropdownMenu from '@/components/book/DropDownMenu';
import DeleteIcon from "@/assets/categories/delete-icon.svg";
import DeleteBookModal from '@/components/book/DeleteBookModal';
import AddButtonIcon from '@/components/AddButtonIcon';


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
        summary: "Set against the backdrop of the racially segregated South during the tumultuous 1930s, To Kill a Mockingbird unfolds through the perspective of young Scout Finch, a precocious girl navigating the complexities of childhood in the small town of Maycomb, Alabama. As the narrative progresses, Scout's innocence is challenged by the harsh realities of prejudice and injustice when her father, Atticus Finch, takes on the formidable task of defending Tom Robinson, a Black man wrongfully accused of raping a white woman.\n\n The novel delves deep into the themes of racism, exploring how deeply entrenched societal biases shape the lives of its characters and the community at large. Scout, along with her brother Jem and their friend Dill, grapple with their understanding of morality and justice as they witness the community's reaction to the trial. Through her interactions with various townsfolk, including the enigmatic Boo Radley, Scout learns invaluable lessons about empathy, compassion, and the importance of standing up for what is right, even when it is unpopular. \n\n As Atticus bravely confronts the prejudices that pervade Maycomb, the narrative not only highlights his moral courage but also serves as a poignant commentary on the struggles against systemic racism and the quest for justice in a deeply divided society. The story ultimately reflects the loss of innocence that accompanies the realization of societal flaws, while also emphasizing the potential for growth and understanding in the face of adversity. Through Scout’s eyes, Harper Lee masterfully weaves a tale that resonates with readers, inviting them to reflect on their own beliefs and the enduring impact of empathy in the fight against injustice.",
        image: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
        isFavorite: favorite,
        addToLibrary: false,
        genres: "Fiction, Dystopian,Historical Fiction,Science Fiction",
        rating: 4
    }

    const genresAsArray = BookObj.genres?.split(",") || [""];

    const handleMoveToCategory = (category: string) => {
        console.log(`Moving book to category: ${category}`);
    };

    const handleDeleteBook = () => {
        setIsDeleteModalVisible(false);
        console.log(`Deleting ${book} from reccomendations`);
    };

    // Extract both category and book slugs
    const { book } = useLocalSearchParams();

    console.log(book, "is reccomended");

    return (
        <>
            <SafeAreaView>

                <View className='flex-row justify-end items-center'>

                    <Pressable className="p-1 mr-2" onPress={() => setIsDeleteModalVisible(!isDeleteModalVisible)} >
                        <DeleteIcon width={40} height={40} />
                    </Pressable>

                    {/* Delete Modal that shows up when delete button on the top right is pressed*/}
                    <DeleteBookModal
                        visible={isDeleteModalVisible}
                        onClose={() => setIsDeleteModalVisible(false)}
                        onConfirm={handleDeleteBook}
                    />



                    <Pressable onPress={() => setFavorite(!favorite)} className=" p-1 mr-2">
                        <FavoriteButtonIcon isFavorite={favorite} StrokeColor='white' />
                    </Pressable>

                    <Pressable onPress={() => setIsMoveMenuVisible(!isMoveMenuVisible)} className="p-1 mr-2" >

                        <AddButtonIcon isAdded={isMoveMenuVisible} />
                    </Pressable>
                    {/* Custom DropdownMenu */}
                    <DropdownMenu
                        visible={isMoveMenuVisible}
                        items={genresAsArray}
                        onSelect={handleMoveToCategory}
                        onClose={() => setIsMoveMenuVisible(false)}
                        heading="Add To Category"
                    />
                </View>

                <View>
                    <BookCard book={BookObj} />
                </View>

                <View className="pl-1 pt-5">
                    <ScrollableGenres genres={genresAsArray} />
                </View>

                {/* <View className="pl-2 pt-5">
                    <Reviews reviews={BookObj.reviews || [{
                        name: 'John Doe',
                        rating: 4,
                        reviewSummary: 'This book is great!'
                    }]} />
                </View> */}

            </SafeAreaView>



        </>


    )
}

export default BookPage