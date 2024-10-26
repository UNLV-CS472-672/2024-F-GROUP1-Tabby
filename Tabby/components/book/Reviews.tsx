import { View, ScrollView, Text } from "react-native";
import { Review } from "@/types/review";
import StarsRating from "@/components/book/StarsRating";

type ReviewsProps = {
    reviews: Review[],
};

const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
    return (
        <ScrollView className="max-h-72">
            {reviews.map((review, index) => (
                <View className="p-2" key={index}>
                    <View className="flex-row items-center">
                        <Text className="text-white text-lg font-bold mr-2">{review.name}</Text>
                        <StarsRating height={23} width={23} rating={review.rating || 3} />
                    </View>
                    <Text className="text-white text-sm">{review.reviewSummary}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

export default Reviews;
