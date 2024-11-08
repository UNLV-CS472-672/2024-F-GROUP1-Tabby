import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Book } from "@/types/book";

type BookPreviewProps = {
    book: Book;
    button: React.ReactElement<typeof Pressable>;
    isReccommendation?: boolean;
};

const BookPreview: React.FC<BookPreviewProps> = ({ book, button, isReccommendation }) => {
    const router = useRouter();
    const { category } = useLocalSearchParams();

    const handleBookPress = () => {
        if (isReccommendation) {
            router.push(`/recommendations/${book.title}`);
        } else {
            router.push(`/library/${category}/${book.title}`);
        }
    };

    // Use default image if `book.image` is not set or is invalid
    const imageSource = book.image ? { uri: book.image } : require('@/assets/book/default-book-cover.jpg');

    return (
        <Pressable onPress={handleBookPress} className="flex-row items-center p-4 rounded-lg">
            <Image
                source={imageSource}
                className="w-28 h-40 mr-4"
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

export default BookPreview;
