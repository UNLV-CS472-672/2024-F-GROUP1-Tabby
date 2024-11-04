import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FooterNavBar from '@/components/FooterNavBar';
import { styled } from 'nativewind';
import { NativeWindStyleSheet } from "nativewind";

// use to make nativewind styles work on the web
NativeWindStyleSheet.setOutput({
    default: "native",
});

// for the root layout of the page to take entrie screen
const Container = styled(View, 'flex-1 bg-[#1E1E1E]');
// allows the ContentContainer to grow and fill any remaining space in the parent container after other elements (like the FooterNavBar) have taken their space
// This is to have the main content to occupy all available vertical space and have the footer bar at the bottom always
const ContentContainer = styled(View, 'flex-grow');

export default function RootLayout() {
    const pathname = usePathname();
    const isWelcomePage = pathname === '/';

    return (
        <SafeAreaProvider>
            <Container>
                <ContentContainer>
                    <Slot />
                </ContentContainer>
                {!isWelcomePage && <FooterNavBar />}
            </Container>
        </SafeAreaProvider>
    );
}
