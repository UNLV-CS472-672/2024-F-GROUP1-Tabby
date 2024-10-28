import React from 'react';
import { View, Text, FlatList } from 'react-native';

type ScrollableGenresProps = {
    genres: string[],
}

const ScrollableGenres: React.FC<ScrollableGenresProps> = ({ genres }) => {
    return (
        <FlatList
            data={genres}
            horizontal
            keyExtractor={(item, index) => (index.toString() + item)}
            renderItem={({ item }) => (
                <View className='rounded-lg mr-2 border border-white px-4 justify-center items-center h-7'>

                    <Text className="text-white text-sm">{item}</Text>

                </View>

            )}
            showsHorizontalScrollIndicator={false}
        />
    );
};

export default ScrollableGenres;
