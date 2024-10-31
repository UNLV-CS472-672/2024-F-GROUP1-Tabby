import { View, FlatList, Text } from "react-native";
import { Review } from "@/types/review";
import StarsRating from "@/components/book/StarsRating";

type ReviewsProps = {
    reviews: Review[],
};

const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
    return (
        <FlatList
            data={reviews}
            keyExtractor={(item, index) => (index.toString() + item.name)}
            className="max-h-72"
            renderItem={({ item }) => (
                <View className="p-2">
                    <View className="flex-row items-center">
                        <Text className="text-white text-lg font-bold mr-2">{item.name}</Text>
                        <StarsRating height={23} width={23} rating={item.rating || 3} />
                    </View>
                    <Text className="text-white text-sm">{item.reviewSummary}</Text>
                </View>
            )}
        />
    );
};

export default Reviews;
