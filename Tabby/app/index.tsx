import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const WelcomeScreen = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <Text className="text-4xl font-bold mb-4 text-white">Welcome to Tabby</Text>
            <Text className="text-lg text-center mb-8 text-white">
                Scan books and store your book information effortlessly.
            </Text>
            <Link
                className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold"
                href={'/library'}
            >
                Get Started
            </Link>

        </SafeAreaView>
    );
};

export default WelcomeScreen;
