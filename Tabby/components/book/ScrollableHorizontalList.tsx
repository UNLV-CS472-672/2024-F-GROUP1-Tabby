import React from 'react';
import { View, Text, FlatList } from 'react-native';

type ScrollableHorizontalListProps = {
    listOfStrings: string[],
}

const ScrollableHorizontalList: React.FC<ScrollableHorizontalListProps> = ({ listOfStrings }) => {
    return (
        <FlatList
            data={listOfStrings}
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

export default ScrollableHorizontalList;
