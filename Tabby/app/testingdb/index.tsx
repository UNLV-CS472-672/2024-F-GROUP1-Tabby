import React from 'react';
import { Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { dropAllTablesAndMigrate } from '@/database/migration';


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
                Testing Recommended Books
            </Link>

            <Link
                className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold my-5"
                href={'/testingdb/testing-categories'}
            >
                Testing Categories
            </Link>

            <Button title="Reset All Tables" onPress={dropAllTablesAndMigrate} color="#FF5252" />



        </SafeAreaView>
    );
};

export default WelcomeScreen;
