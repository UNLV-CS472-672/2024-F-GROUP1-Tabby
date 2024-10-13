// import 'nativewind/tailwind.css'; // Ensure this import is at the top
import React from 'react';
import { Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <Text className="text-4xl font-bold mb-4 text-white">Welcome to Tabby</Text>
            <Text className="text-lg text-center mb-8 text-white">
                Scan books and store your book information effortlessly.
            </Text>
            <Pressable
                onPress={() => router.push('/categories')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">Get Started</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default WelcomeScreen;
