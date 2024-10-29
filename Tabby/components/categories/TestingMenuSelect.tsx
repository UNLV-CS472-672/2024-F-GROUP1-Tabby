// all code from chat gpt
import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import BarsIcon from '@/components/categories/BarsIcon';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = {
    name: string;
    isPinned: boolean;
    isSelected: boolean;
    position: number;
};

const App: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([
        { name: "Fiction", isPinned: false, isSelected: false, position: 0 },
        { name: "Fantasy", isPinned: false, isSelected: false, position: 1 },
        { name: "Science Fiction", isPinned: false, isSelected: false, position: 2 },
    ]);

    const reorderCategories = (fromIndex: number, toIndex: number) => {
        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(fromIndex, 1);
        newCategories.splice(toIndex, 0, movedCategory);
        setCategories(newCategories);
    };

    const renderItem = ({ item, index }: { item: Category; index: number }) => {
        return (
            <PanGestureHandler onGestureEvent={(event) => {
                const { translationY } = event.nativeEvent;
                if (translationY > 50 && index < categories.length - 1) {
                    reorderCategories(index, index + 1);
                } else if (translationY < -50 && index > 0) {
                    reorderCategories(index, index - 1);
                }
            }}>
                <Animated.View style={[{ padding: 10, marginVertical: 5, borderWidth: 1, borderColor: 'gray', borderRadius: 5 }, item.isSelected ? { backgroundColor: 'lightgray' } : {}]}>
                    <Pressable className="flex-row items-center justify-between">
                        <Pressable className="p-2" onPress={() => reorderCategories(index, Math.max(0, index - 1))}>
                            <BarsIcon />
                        </Pressable>
                        <Text className="text-lg font-bold text-white">{item.name}</Text>
                        <View className="flex-row">


                        </View>
                    </Pressable>
                </Animated.View>
            </PanGestureHandler>
        );
    };

    return (
        <>
            <SafeAreaView className="flex-1 ">
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <FlatList
                        data={categories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        style={{ padding: 10 }}
                    />
                </GestureHandlerRootView>

            </SafeAreaView>

        </>

    );
};

export default App;
