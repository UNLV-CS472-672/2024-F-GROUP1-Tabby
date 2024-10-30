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

const Container = styled(View, 'flex-1 bg-[#1E1E1E]');
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
