import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { Book } from "@/types/book";

import StarsRating from '@/components/book/StarsRating';


type BookCardProps = {
    book: Book;
};

const BookCard: React.FC<BookCardProps> = ({ book }) => {

    return (
        <View className="pl-7 pt-7">
            <View className="flex-row">
                <Image
                    source={{ uri: book.image }}
                    className="w-28 h-40"
                />

                <View className="flex-col pl-4">
                    <Text className="text-lg font-bold text-white">{book.title}</Text>
                    <Text className="text-md text-white font-semibold italic">{book.author}</Text>
                    <Text className="mt-3 text-lg text-white">Rating</Text>
                    <StarsRating rating={book.rating || 3} />
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
