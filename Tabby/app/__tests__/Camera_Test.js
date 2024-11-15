import React from 'react';
import FooterNavBar from '@/components/FooterNavBar';
import * as ImagePicker from "expo-image-picker";
import CameraModal from "@/components/camera/CameraModel";
import { render, fireEvent, act, screen, waitFor } from '@testing-library/react-native';


// when opening modal 5000ms is not enough time to open when testing
// so doubling it here gives enough time
jest.setTimeout(10000);

jest.mock('expo-router', () => ({
    usePathname: jest.fn(() => '/library'),
    Link: ({ children }) => <>{children}</>,
}));

jest.mock('expo-image-picker', () => {
    const actualModule = jest.requireActual('expo-image-picker');
    return {
        launchCameraAsync: jest.fn(),
        requestCameraPermissionsAsync: jest.fn(),
        MediaTypeOptions: actualModule.MediaTypeOptions,  // Include MediaTypeOptions
        requestMediaLibraryPermissionsAsync: jest.fn(),
        launchImageLibraryAsync: jest.fn(),
    };
});

// tests related to the camera
describe('Camera tests', () => {
    // check to see if Camera modal opens when button is pressed
    // async because when updaing a modal we have to wait for it to finish
    // otherwise RNTL throws an error
    test('Camera model opens', async () => {
        // renders the navbar 
        const page = render(<FooterNavBar />);
        // gets the camera button
        const cameraButton = page.getByTestId('CameraButton');

        // clicks the camera button
        await act(async () => {
            fireEvent.press(cameraButton);
        });

        // makes sure modal shows up by checking if some of the text from the modal appears
        const modalTest = await screen.findByText('Take Picture');

        // if the text does appear then the test passes
        expect(modalTest).toBeTruthy();
    })

    // check to see if camera opens when pressing the Take Picture button
    // async because when updating a modal we have to wait for it to finish
    // otherwise RNTL throws an error   
    test('Camera opens with permissions granted', async () => {
        // create a mock image
        const mockImage = {
            uri: 'tempuri',
            base64: 'tempbase64',
        }

        // mock canceled response for launchCameraAsync
        ImagePicker.launchCameraAsync.mockResolvedValue({
            assets: [mockImage],
            canceled: false,
        });

        // mock all response for camera permissions
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
            granted: true,
            expires: 'never',
        });

        // renders the camera modal
        const page = render(<CameraModal closeModal={() => false} />);

        // gets the take picture button
        const takePictureButton = page.getByTestId('takePictureButton');

        // clicks take picture button
        await act(async () => {
            fireEvent.press(takePictureButton);
        })

        // wait to see if launchCameraAsync and requestCameraPermissionsAsync was called
        await waitFor(() => {
            expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
        });
    });

    // check to see if camera doesnt open when no permissions are granted
    // async because when updating a modal we have to wait for it to finish
    // otherwise RNTL throws an error   
    test('Camera doesnt open when not given permissions', async () => {
        // create a mock image
        const mockImage = {
            uri: 'tempuri',
            base64: 'tempbase64',
        }

        // mock failed response for launchCameraAsync
        ImagePicker.launchCameraAsync.mockResolvedValue({
            assets: [mockImage],
            canceled: false,
        });

        // mock all response for camera permissions
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
            granted: false,
            expires: 'never',
        });

        // renders the camera modal
        const page = render(<CameraModal closeModal={() => false} />);

        // gets the take picture button
        const takePictureButton = page.getByTestId('takePictureButton');

        // clicks take picture button
        await act(async () => {
            fireEvent.press(takePictureButton);
        })

        // expect requestCameraPermissionsAsync to have been called again but not launchCameraAsync
        // need to use .toHaveBeencalledTimes here because .toHaveBeenCalled tracks
        // the calls from the previous test
        await waitFor(() => {
            expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(2);
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
        });
    });

    // check to see if photo library opens when pressing the Pick from camera roll button
    // async because when updaing a modal we have to wait for it to finish
    // otherwise RNTL throws an error
    test('Camera Roll opens correctly', async () => {
        // create a mock image
        const mockImage = {
            uri: 'tempuri',
            base64: 'tempbase64',
        }

        // mock all response for media library permissions
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
            accessPrivileges: 'all',
            granted: true,
        });

        // mock successful response for launchImageLibraryAsync
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            assets: [mockImage],
            canceled: false,
        });

        // renders the camera modal
        const page = render(<CameraModal closeModal={() => false} />);

        // gets the open camera roll picture button
        const pickPhotoButton = page.getByTestId('pickPhotoButton');

        // clicks on open camera roll button
        await act(async () => {
            fireEvent.press(pickPhotoButton);
        })

        // wait to see if launchImageLibraryAsync and requestMediaLibraryPermissionsAsync was called
        await waitFor(() => {
            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });
    });

    // check to see if photo library doesnt open when pressing the Pick from camera roll button and not granted permission
    // async because when updaing a modal we have to wait for it to finish
    // otherwise RNTL throws an error
    test('Camera Roll opens correctly', async () => {
        // create a mock image
        const mockImage = {
            uri: 'tempuri',
            base64: 'tempbase64',
        }

        // mock all response for media library permissions
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
            accessPrivileges: 'all',
            granted: false,
        });

        // mock successful response for launchImageLibraryAsync
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            assets: [mockImage],
            canceled: false,
        });

        // renders the camera modal
        const page = render(<CameraModal closeModal={() => false} />);

        // gets the open camera roll picture button
        const pickPhotoButton = page.getByTestId('pickPhotoButton');

        // clicks on open camera roll button
        await act(async () => {
            fireEvent.press(pickPhotoButton);
        })

        // wait to see if launchImageLibraryAsync wasnt called and requestMediaLibraryPermissionsAsync was called
        // need to use .toHaveBeencalledTimes here because .toHaveBeenCalled tracks
        await waitFor(() => {
            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(2);
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
        });
    });
});
