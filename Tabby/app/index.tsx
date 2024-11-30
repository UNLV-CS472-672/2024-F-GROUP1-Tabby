import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { getAllCategories } from '@/database/databaseOperations';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import LoadingSpinner from '@/components/LoadingSpinner';

const WelcomeScreen = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // will check if there are any categories if there are some no need to welcome user as they have used the app before
    useEffect(() => {
        try {

            setIsLoading(true);

            const getCategories = async () => {
                return await getAllCategories();
            }

            getCategories().then((categories) => {
                if (categories && categories.length > 0) {
                    router.push('/library');
                }
            });


        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }



    }, [router]);

    return (
        <>
            {isLoading ? <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full"><LoadingSpinner /> </SafeAreaView>
                : <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
                    <Text className="text-4xl font-bold mb-4 text-white">Welcome to Tabby</Text>
                    <Text className="text-lg text-center mb-8 text-white">
                        Scan books and store your book information effortlessly.
                    </Text>
                    <Link
                        className="bg-blue-600 py-2 px-4 rounded text-white text-lg font-semibold"
                        href={'/library'}
                        testID="get-started-button" // Add testID here
                    >
                        Get Started
                    </Link>

                </SafeAreaView>}

        </>
    );
};

export default WelcomeScreen;
