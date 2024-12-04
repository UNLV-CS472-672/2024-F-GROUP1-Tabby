import React, { Suspense } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import FooterNavBar from '@/components/FooterNavBar';
import { styled } from 'nativewind';
import { NativeWindStyleSheet } from "nativewind";
import LoadingSpinner from '@/components/LoadingSpinner';
import { migrateDbIfNeeded } from '@/database/migration';
import ArrowBackIcon from '@/assets/menu-icons/arrow-back-icon.svg';
import { SafeAreaView } from "react-native-safe-area-context";

// Configure nativewind for web compatibility
NativeWindStyleSheet.setOutput({
    default: "native",
});

// Container styling for full screen
const Container = styled(View, 'flex-1 bg-[#1E1E1E]');
const ContentContainer = styled(View, 'flex-grow');

function Fallback() {
    return (
        <View testID="LoadingSpinner">
            <LoadingSpinner />
        </View>
    );
}

function BackButton() {
    const router = useRouter();

    return (

        <Pressable onPress={() => router.back()} className='p-2'>
            <ArrowBackIcon height={36} width={36} />
        </Pressable>
    );

}

export default function RootLayout() {
    const pathname = usePathname();
    const isWelcomePage = pathname === '/';

    return (
        <SafeAreaProvider testID="SafeAreaProvider">
            <Container testID="RootLayoutContainer">
                <Suspense fallback={<Fallback />}>
                    <SQLiteProvider databaseName="bookCollection.db" onInit={migrateDbIfNeeded} useSuspense >
                        <ContentContainer testID="ContentContainer">
                            {!isWelcomePage && (
                                <SafeAreaView className='flex-row justify-start items-center space-x-5'>
                                    <BackButton />
                                    <Text className="text-white text-2xl font-bold">Tabby</Text>
                                </SafeAreaView>
                            )}
                            <Slot />
                        </ContentContainer>
                        {!isWelcomePage &&
                            <View testID="FooterNavBar">
                                <FooterNavBar />
                            </View>}
                    </SQLiteProvider>
                </Suspense>
            </Container>
        </SafeAreaProvider>
    );
}
