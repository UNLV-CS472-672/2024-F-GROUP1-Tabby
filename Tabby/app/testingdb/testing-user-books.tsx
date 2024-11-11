import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';


import TestUserBooks from '@/components/testingDatabase/testUserBooks';


const testing = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <TestUserBooks />
        </SafeAreaView>
    );
};

export default testing
