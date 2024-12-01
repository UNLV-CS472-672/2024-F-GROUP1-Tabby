import { useState } from 'react';
import { Text, View, Image } from 'react-native';
import { Book } from "@/types/book";

type BookSearchPreviewProps = {
    book: Book;
};

const BookSearchPreview: React.FC<BookSearchPreviewProps> = ({
    book,
}) => {

    const defaultBookImage = require('@/assets/book/default-book-cover.jpg');

    // State to handle image source
    const [imageSource, setImageSource] = useState(book.image ? { uri: book.image } : defaultBookImage);

    // Handle image load error by setting a default image
    const handleImageError = () => {
        setImageSource(defaultBookImage);
    };

    return (
        <>
            <Image
                source={imageSource}
                className="w-28 h-40 mr-4"
                resizeMode="cover"
                alt="book cover"
                onError={handleImageError} // Trigger error handling on image load failure
            />
            <View className="flex-1">
                <Text className="text-lg font-bold text-black">{book.title}</Text>
                <Text className="text-sm text-black italic" numberOfLines={1}>{book.author}</Text>
                <Text className="text-sm text-black" numberOfLines={2}>{book.summary}</Text>
            </View>
        </>

    );
};

export default BookSearchPreview;
