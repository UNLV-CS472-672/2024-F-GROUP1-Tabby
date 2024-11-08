import { View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import BookCard from '@/components/book/BookCard';
import ScrollableGenres from '@/components/book/ScrollableGenres';
import Reviews from '@/components/book/Reviews';
import { Book } from "@/types/book";
import { Review } from "@/types/review";
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

    // test data for reviews to see how reviews would look
    const ReviewsArray: Review[] = [
        {
            name: 'John Doe',
            rating: 4,
            reviewSummary: 'This book is great! I highly recommend it! It is a must read. The way Harper Lee portrays complex social issues through the innocent eyes of a child is both powerful and poignant. The characters are memorable, and the themes of empathy and justice are incredibly relevant today.'
        },
        {
            name: 'Jane Doe',
            rating: 3,
            reviewSummary: 'This book is okay. While it tackles important themes of racism and moral growth, I found some parts to be slow and less engaging. The narrative perspective is unique, but I struggled to connect with all the characters. It has its merits, but it didn’t fully resonate with me.'
        },
        {
            name: 'Emily Smith',
            rating: 5,
            reviewSummary: 'A timeless classic that everyone should read! Harper Lee’s story beautifully captures the struggles of childhood and moral integrity. Scout’s perspective on justice and empathy is both touching and thought-provoking. The relationships in the book, especially between Scout and Atticus, offer profound insights into human nature and compassion.'
        },
        {
            name: 'Michael Johnson',
            rating: 2,
            reviewSummary: 'Not as impactful as I expected. I appreciated the themes, but the pacing felt uneven, particularly in the second half. I struggled to connect with the characters emotionally. While it’s a notable work in literature, I found the execution lacking in depth, which left me wanting more.'
        },
        {
            name: 'John York',
            rating: 4,
            reviewSummary: 'This book is great! I highly recommend it! It is a must read. The way Harper Lee portrays complex social issues through the innocent eyes of a child is both powerful and poignant. The characters are memorable, and the themes of empathy and justice are incredibly relevant today.'
        },
        {
            name: 'Jane Boe',
            rating: 3,
            reviewSummary: 'This book is okay. While it tackles important themes of racism and moral growth, I found some parts to be slow and less engaging. The narrative perspective is unique, but I struggled to connect with all the characters. It has its merits, but it didn’t fully resonate with me.'
        },
        {
            name: 'Emily Mith',
            rating: 5,
            reviewSummary: 'A timeless classic that everyone should read! Harper Lee’s story beautifully captures the struggles of childhood and moral integrity. Scout’s perspective on justice and empathy is both touching and thought-provoking. The relationships in the book, especially between Scout and Atticus, offer profound insights into human nature and compassion.'
        },
        {
            name: 'Michael John',
            rating: 2,
            reviewSummary: 'Not as impactful as I expected. I appreciated the themes, but the pacing felt uneven, particularly in the second half. I struggled to connect with the characters emotionally. While it’s a notable work in literature, I found the execution lacking in depth, which left me wanting more.'
        }
    ];

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
        reviews: ReviewsArray,
        genres: ['Fiction', 'Dystopian'],
        rating: 4
    }

    const categories = ["Fiction", "Non-Fiction", "Mystery", "Sci-Fi", "Dystopian"];

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
                        items={categories}
                        onSelect={handleMoveToCategory}
                        onClose={() => setIsMoveMenuVisible(false)}
                        heading="Add To Category"
                    />
                </View>

                <View>
                    <BookCard book={BookObj} />
                </View>

                <View className="pl-1 pt-5">
                    <ScrollableGenres genres={['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Dystopian']} />
                </View>

                <View className="pl-2 pt-5">
                    <Reviews reviews={BookObj.reviews || [{
                        name: 'John Doe',
                        rating: 4,
                        reviewSummary: 'This book is great!'
                    }]} />
                </View>

            </SafeAreaView>


        </>


    )
}

export default BookPage