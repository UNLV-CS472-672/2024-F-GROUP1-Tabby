import React from "react";
import { Text, View, Image, ScrollView, Pressable, Dimensions } from "react-native";
import { useState } from "react";
import { Book } from "@/types/book";

import StarsRating from "@/components/book/StarsRating";

type BookCardProps = {
  book: Book;
  showBookRatingModal?: () => void;
};

const BookCard: React.FC<BookCardProps> = ({ book, showBookRatingModal }) => {
  const defaultBookImage = require("@/assets/book/default-book-cover.jpg");
  // Use default image if `book.image` is not set or is invalid
  const [imageSource, setImageSource] = useState(
    book.image ? { uri: book.image } : defaultBookImage
  );

  // Handle image load error by setting a default image
  const handleImageError = () => {
    setImageSource(defaultBookImage);
  };

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const isSmallPhone = screenWidth <= 400 && screenHeight <= 890;
  console.log("isSmallPhone: ", isSmallPhone);
  console.log("screenWidth: ", screenWidth);
  console.log("screenHeight: ", screenHeight);

  // Define dynamic styles
  const dynamicStyles = {
    ScrollViewMaxHeight: isSmallPhone ? 176 : undefined,
    titleMaxWidth: isSmallPhone ? 160 : 208,
    authorMaxWidth: isSmallPhone ? 160 : 208,
    summaryMaxHeight: isSmallPhone ? undefined : 128, // 100 pixels max height for small phones
  };


  return (
    <ScrollView className="" style={{ maxHeight: dynamicStyles.ScrollViewMaxHeight }}>
      <View className="pl-7 pt-7">

        <View className="flex-row">
          <Image
            source={imageSource}
            className="w-36 h-52"
            onError={handleImageError} // Trigger error handling on image load failure
          />

          <View className="flex-col pl-4 w-52">
            <ScrollView className="max-h-10" nestedScrollEnabled={true}>
              <Text className="text-lg font-bold text-white" style={{ maxWidth: dynamicStyles.titleMaxWidth }}>{book.title}

              </Text>
            </ScrollView>

            <ScrollView className="max-h-5" nestedScrollEnabled={true} style={{ maxWidth: dynamicStyles.authorMaxWidth }}>
              <Text className="text-md text-white font-semibold italic w-40">
                By {book.author}
              </Text>
            </ScrollView>

            <Text className="mt-3 text-lg text-white">Rating</Text>
            <Pressable className="p-1" onPress={showBookRatingModal}>
              <StarsRating rating={book.rating || 0} />
            </Pressable>
          </View>
        </View>

        <View className="pt-2">
          <Text className="text-lg text-white">Summary</Text>
          <ScrollView className="" nestedScrollEnabled={true} style={{ maxHeight: dynamicStyles.summaryMaxHeight }}>
            <Text className="text-sm text-white p-1">{book.summary}</Text>
          </ScrollView>
        </View>


      </View>

    </ScrollView>

  );
};

export default BookCard;
