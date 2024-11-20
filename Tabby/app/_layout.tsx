import React, { Suspense } from 'react';
import { View, Text } from 'react-native';
import { Slot } from 'expo-router';
import { usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import FooterNavBar from '@/components/FooterNavBar';
import { styled } from 'nativewind';
import { NativeWindStyleSheet } from "nativewind";
import { migrateDbIfNeeded } from '@/database/migration';

// Configure nativewind for web compatibility
NativeWindStyleSheet.setOutput({
    default: "native",
});

// Container styling for full screen
const Container = styled(View, 'flex-1 bg-[#1E1E1E]');
// Content container styling to occupy available space
const ContentContainer = styled(View, 'flex-grow');

// Fallback component displayed while database initializes
function Fallback() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Loading...</Text>
        </View>
    );
}

export default function RootLayout() {
    const pathname = usePathname();
    const isWelcomePage = pathname === '/';

    return (
        <SafeAreaProvider>
            <Container>
                <Suspense fallback={<Fallback />}>
                    <SQLiteProvider databaseName="bookCollection.db" onInit={migrateDbIfNeeded} useSuspense>
                        <ContentContainer>
                            <Slot />
                        </ContentContainer>
                        {!isWelcomePage && <FooterNavBar />}
                    </SQLiteProvider>
                </Suspense>
            </Container>
        </SafeAreaProvider>
    );
}