import React from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';

const LoadingSpinner = () => {
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-[#1E1E1E]">
            <ActivityIndicator size="large" />
        </SafeAreaView>
    );
};

export default LoadingSpinner;
