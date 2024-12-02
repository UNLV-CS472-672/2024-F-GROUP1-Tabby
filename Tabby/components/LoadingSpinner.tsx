import React from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';

const LoadingSpinner = () => {
    return (
        <SafeAreaView className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
        </SafeAreaView>
    );
};

export default LoadingSpinner;
