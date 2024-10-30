import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FooterNavBar from '@/components/FooterNavBar';
import { styled } from 'nativewind';
import { NativeWindStyleSheet } from "nativewind";


NativeWindStyleSheet.setOutput({
    default: "native",
});
const Container = styled(View, 'flex-1 bg-[#1E1E1E]'); // Replace 'bg-yourColorHere' with your desired Tailwind class

export default function RootLayout() {
    const pathname = usePathname();
    // flag to check if the current route is in index, welcome page
    const isWelcomePage = pathname === '/';
    return (
        <SafeAreaProvider>
            <Container>
                <Slot />

                {/* Only show the footer if the current route is not the welcome page */}
                {!isWelcomePage && <FooterNavBar />}
            </Container>
        </SafeAreaProvider>

    );
}
