import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Book } from "@/types/book";


type BookCardProps = {
    book: Book;
    button: React.ReactElement<typeof Pressable>; // Expecting a Pressable component
    isReccommendation?: boolean;
};

const BookCard: React.FC<BookCardProps> = ({ book, button, isReccommendation }) => {
    const router = useRouter();
    const { category } = useLocalSearchParams();


    const handleBookPress = () => {
        // book card is in reccommendation page so go to specific book reccommendation page
        if (isReccommendation) {
            router.push(`/recommendations/${book.title}`);
        }
        // book card is in library so go to specific book in library
        else {
            router.push(`/library/${category}/${book.title}`);

        }

    };

    return (
        <Pressable onPress={handleBookPress} className="flex-row items-center p-4 rounded-lg mb-4">
            <Image
                source={{ uri: book.image }}
                className="w-16 h-24 mr-4"
                resizeMode="cover"
                alt="book cover"
            />
            <View className="flex-1">
                <Text className="text-lg font-bold text-white">{book.title}</Text>
                <Text className="text-sm text-white italic">{book.author}</Text>
                <Text className="text-sm text-white" numberOfLines={2}>{book.summary}</Text>
            </View>
            {button}
        </Pressable>
    );
};

export default BookCard;
