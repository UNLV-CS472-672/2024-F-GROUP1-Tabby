import { useState } from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Book } from "@/types/book";

type BookPreviewProps = {
    book: Book;
    button: React.ReactElement<typeof Pressable>;
    isRecommendation?: boolean;
    toggleSelected?: (id: string) => void;
    selectedBooks?: string[]; // List of selected book IDs
};

const BookPreview: React.FC<BookPreviewProps> = ({
    book,
    button,
    isRecommendation,
    toggleSelected,
    selectedBooks = []
}) => {
    const router = useRouter();
    const { category } = useLocalSearchParams();

    const isSelected = selectedBooks.includes(book.id);
    const defaultBookImage = require('@/assets/book/default-book-cover.jpg');

    // State to handle image source
    const [imageSource, setImageSource] = useState(book.image ? { uri: book.image } : defaultBookImage);

    const handleBookPress = () => {
        // If any books are selected, toggle the current book's selection
        if (selectedBooks.length > 0) {
            handleSelectedPress();
            return;
        }

        // Navigate to book detail page if no books are selected
        if (isRecommendation) {
            router.push(`/recommendations/${book.id}`);
        } else {
            router.push(`/library/${category}/${book.id}`);
        }
    };

    const handleSelectedPress = () => {
        if (toggleSelected) {
            toggleSelected(book.id);
        }
    };

    const buttonStyles = isSelected ? "bg-blue-500 opacity-80" : "";

    // Handle image load error by setting a default image
    const handleImageError = () => {
        setImageSource(defaultBookImage);
    };

    return (
        <Pressable
            onPress={handleBookPress}
            onLongPress={handleSelectedPress}
            className={`flex-row items-center p-4 rounded-lg ${buttonStyles} my-1`}
        >
            <Image
                source={imageSource}
                className="w-28 h-40 mr-4"
                resizeMode="cover"
                alt="book cover"
                onError={handleImageError} // Trigger error handling on image load failure
            />
            <View className="flex-1">
                <Text className="text-lg font-bold text-white" numberOfLines={2}>{book.title}</Text>
                <Text className="text-sm text-white italic" numberOfLines={1}>{book.author}</Text>
                <Text className="text-sm text-white" numberOfLines={2}>{book.summary}</Text>
            </View>
            {selectedBooks.length > 0 ? null : button}
        </Pressable>
    );
};

export default BookPreview;
