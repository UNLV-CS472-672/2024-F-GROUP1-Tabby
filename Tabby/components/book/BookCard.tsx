import React from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import { Book } from "@/types/book";

import StarsRating from '@/components/book/StarsRating';


type BookCardProps = {
    book: Book;
};

const BookCard: React.FC<BookCardProps> = ({ book }) => {

    const defaultBookImage = require('@/assets/book/default-book-cover.jpg');
    // Use default image if `book.image` is not set or is invalid
    const [imageSource, setImageSource] = useState(book.image ? { uri: book.image } : defaultBookImage);

    // Handle image load error by setting a default image
    const handleImageError = () => {
        setImageSource(defaultBookImage);
    };

    return (
        <View className="pl-7 pt-7">
            <View className="flex-row">
                <Image
                    source={imageSource}
                    className="w-36 h-52"
                    onError={handleImageError} // Trigger error handling on image load failure
                />

                <View className="flex-col pl-4">

                    <ScrollView className='max-h-16'>
                        <Text className="text-lg font-bold text-white w-56" >{book.title}</Text>
                    </ScrollView>

                    <ScrollView className='max-h-5'>
                        <Text className="text-md text-white font-semibold italic w-56"> By {book.author}</Text>
                    </ScrollView>




                    <Text className="mt-3 text-lg text-white">Rating</Text>
                    <StarsRating rating={book.rating || 0} />
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
