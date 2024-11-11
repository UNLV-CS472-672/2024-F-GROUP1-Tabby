import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import TestCategories from '@/components/testingDatabase/testingCategories';

const testing = () => {

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E] h-full">
            <TestCategories />
        </SafeAreaView>
    );
};

export default testing
