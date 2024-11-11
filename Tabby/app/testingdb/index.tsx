import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const WelcomeScreen = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">

            <Link
                className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold"
                href={'/testingdb/testing-user-books'}
            >
                Testing User Books
            </Link>

            <Link
                className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold mt-5"
                href={'/testingdb/testing-reccomended-books'}
            >
                Testing Reccomended Books
            </Link>

            <Link
                className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold mt-5"
                href={'/testingdb/testing-categories'}
            >
                Testing Categories
            </Link>

        </SafeAreaView>
    );
};

export default WelcomeScreen;
