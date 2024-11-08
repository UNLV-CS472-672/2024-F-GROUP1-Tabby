// import React from 'react';
// import { usePathname } from "expo-router";
// import FooterNavBar from '@/components/FooterNavBar';
// import { render, fireEvent, act } from '@testing-library/react-native';

// jest.mock('expo-router', () => ({
//     usePathname: jest.fn(() => '/app'),
//     Link: ({ children }) => <>{children}</>,
// }));

// test('Camera model opens', () => {
//     const page = render(<FooterNavBar />);
//     const cameraButton = page.getByTestId('CameraButton');

//     act(() => {
//         fireEvent.press(cameraButton);
//     });

//     expect(usePathname()).toBe('/library');
// })

