import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { Book } from "@/types/book";

import StarsRating from '@/components/book/StarsRating';


type BookCardProps = {
    book: Book;
};

const BookCard: React.FC<BookCardProps> = ({ book }) => {

    // Use default image if `book.image` is not set or is invalid
    const imageSource = book.image ? { uri: book.image } : require('@/assets/book/default-book-cover.jpg');

    return (
        <View className="pl-7 pt-7">
            <View className="flex-row">
                <Image
                    source={imageSource}
                    className="w-36 h-52"
                />

                <View className="flex-col pl-4">
                    <Text className="text-lg font-bold text-white">{book.title}</Text>
                    <Text className="text-md text-white font-semibold italic"> By {book.author}</Text>
                    <Text className="mt-3 text-lg text-white">Rating</Text>
                    <StarsRating rating={book.rating || 1} />
                </View>

            </View>

            <View className="pt-2">
                <Text className="text-lg text-white">Summary</Text>
                <ScrollView className='max-h-40'>
                    <Text className="text-sm text-white">{book.summary}</Text>
                </ScrollView>

            </View>
        </View>



    );

};

export default BookCard;
