// import 'nativewind/tailwind.css'; // Ensure this import is at the top
import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E]">
            <Text className="text-4xl font-bold mb-4 text-white">Welcome to Tabby</Text>
            <Text className="text-lg text-center mb-8 text-white">
                Scan books and store your book information effortlessly.
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/categories')}
                className="bg-blue-600 py-2 px-4 rounded"
            >
                <Text className="text-white text-lg font-semibold">Get Started</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default WelcomeScreen;
