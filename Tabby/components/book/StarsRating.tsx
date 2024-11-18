import React from "react";
import { FlatList } from "react-native";
import StarIcon from "@/components/book/StarIcon";

type StarsRatingProps = {
    rating: 0 | 1 | 2 | 3 | 4 | 5;
    height?: number;
    width?: number;
};

const StarsRating: React.FC<StarsRatingProps> = ({ rating, height = 25, width = 25 }) => {
    const stars = [1, 2, 3, 4, 5];

    // used to make the correct stars yellow
    const renderStar = ({ item }: { item: number }) => (
        <StarIcon isRated={item <= rating} height={height} width={width} />

    );

    return (

        <FlatList
            data={stars}
            renderItem={renderStar}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
        />

    );
};

export default StarsRating;
