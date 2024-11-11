import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import TestRecommendedBooks from '@/components/testingDatabase/testReccomendedBooks';

const testing = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <TestRecommendedBooks />
        </SafeAreaView>
    );
};

export default testing
