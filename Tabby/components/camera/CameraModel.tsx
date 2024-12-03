import { View, Text, Pressable, Modal, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Book } from '@/types/book';
import { useSearchParams } from "expo-router/build/hooks";

interface CameraModalProps {
    closeModal: () => void;
    onBookSelectionStart: (tempBooks: Book[], isShelf: boolean) => void;
}

type apiReturn = {
    authors: string         // separated by commas
    excerpt: string
    isbn: string            // guaranteed to be provided, ISBN 13
    page_count: number      // -1 if not given
    published_date: string  // YYYY-MM-DD
    publisher: string
    rating: number          // -1.0 if not given
    summary: string
    thumbnail: string
    title: string
};

const gpuUrl = process.env.EXPO_PUBLIC_GPU_API_URL;
const cpuUrl = process.env.EXPO_PUBLIC_CPU_US_API_URL;

const CameraModal: React.FC<CameraModalProps> = ({ closeModal, onBookSelectionStart }) => {
    // const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    // use to disable the buttons temporarily when clicking them to prevent multiple clicks
    const [isProcessing, setIsProcessing] = useState(false);
    // used to determine if the user is currently choosing which book is the correct one
    const [userChoosing, setUserChoosing] = useState(false);

    // Handle taking a picture by requesting permissions before taking the picture if necessary
    const handleTakePicture = async () => {
        setIsProcessing(true);
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            setIsProcessing(false);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: .4,
        });

        if (!result.canceled) {
            const returnedBooks = await uploadImage(result.assets[0].uri);
            if (returnedBooks)
                await userPickBook(returnedBooks, false);
        }
        setIsProcessing(false);
    };

    // Handle picking an image from the gallery by requesting permissions before picking the image if necessary
    const handlePickImage = async () => {
        setIsProcessing(true);
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            setIsProcessing(false);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: .4,
        });

        if (!result.canceled) {
            const returnedBooks = await uploadImage(result.assets[0].uri);
            if (returnedBooks)
                await userPickBook(returnedBooks, false);
        }
        setIsProcessing(false);
    };

    // handle user sending in shelf image from camera roll
    const handlePickShelfImage = async () => {
        setIsProcessing(true);
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            setIsProcessing(false);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: .4,
        });

        if (!result.canceled) {
            const returnedBooks = await uploadShelfImage(result.assets[0].uri);
            if (returnedBooks)
                await userPickBook(returnedBooks, true);
        }
        setIsProcessing(false);
    };
    // handle user sending in a shelf image
    const handleTakeShelfPicture = async () => {
        setIsProcessing(true);
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            setIsProcessing(false);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: .4,
        });

        if (!result.canceled) {
            const returnedBooks = await uploadShelfImage(result.assets[0].uri);
            if (returnedBooks)
                await userPickBook(returnedBooks, true);
        }
        setIsProcessing(false);
    };
    // uploads image to scan_shelf endpoint
    const uploadShelfImage = async (imageUri: string) => {
        try {
            console.log("Sending koyeb image");
            // convert image to blob raw data
            const res = await fetch(imageUri);
            const blob = await res.blob();
            // fetch titles and authors from scan_cover
            const books = await fetch(`${gpuUrl}/books/scan_shelf?nosearch=false`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: blob,
            });

            // show user books that were found from shelf
            let returnedBooks: Book[] = [];
            if (books.ok) {
                console.log('success');
                const result = await books.json();
                console.log(result);
                for (let i = 0; i < result.titles.length; i++) {
                    const url = new URL(`${cpuUrl}books/search`);

                    url.searchParams.append('author', result.authors[i]);
                    url.searchParams.append('title', result.titles[i]);

                    // fetch books from US server
                    const response = await fetch(url);

                    if (response.ok) {
                        const temp = await response.json();
                        returnedBooks.push(jsonToBook(temp.results[0]));
                    } else {
                        console.error("error with searches: ", response.status);
                        const errorText = await response.text();
                        console.error("error details: ", errorText);
                    }
                }
            } else {
                console.error("error uploading image: ", books.status);
                const errorText = await books.text();
                console.error("Error details: ", errorText);
            }
            return returnedBooks;
        } catch (error) {
            console.error("Catch Error uploading image:", error);
        }
    }

    // for testing activity indicator
    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Opens modal for user to select correct book
    const userPickBook = async (bookArr: Book[], isShelf: boolean) => {
        await setUserChoosing(true);

        // DONT REMOVE THIS SLEEP
        // idk why but if you remove it then shit breaks
        await sleep(1000);

        if (onBookSelectionStart) {
            onBookSelectionStart(bookArr, isShelf);
        }
    }

    // uploads image to scan_cover endpoint
    const uploadImage = async (imageUri: string) => {
        try {
            console.log("Sending koyeb image");

            // convert image to blob raw data
            const res = await fetch(imageUri);
            const blob = await res.blob();

            // fetch title and author from scan_cover
            const titles = await fetch(`${gpuUrl}books/scan_cover?nosearch=false`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: blob,
            });

            if (titles.ok) {
                const book = await titles.json();
                const url = new URL(`${cpuUrl}books/search`);

                url.searchParams.append('author', book.author);
                url.searchParams.append('title', book.title);

                // fetch books from US server
                const response = await fetch(url);

                // add first 4 returned books to an array which are the books that the user can choose from
                let returnedBooks: Book[] = [];
                if (response.ok) {
                    console.log('success');
                    const result = await response.json();
                    if (result.results[0]) {
                        const book1 = jsonToBook(result.results[0]);
                        returnedBooks.push(book1);
                    }
                    if (result.results[1]) {
                        const book2 = jsonToBook(result.results[1]);
                        if (returnedBooks.findIndex(c => c.isbn === book2.isbn)) {
                            returnedBooks.push(book2);
                        }
                    }
                    if (result.results[2]) {
                        const book3 = jsonToBook(result.results[2]);
                        if (returnedBooks.findIndex(c => c.isbn === book3.isbn)) {
                            returnedBooks.push(book3);
                        }
                    }
                    if (result.results[3]) {
                        const book4 = jsonToBook(result.results[3]);
                        if (returnedBooks.findIndex(c => c.isbn === book4.isbn)) {
                            returnedBooks.push(book4);
                        }
                    }
                } else {
                    console.error("error uploading author and title: ", response.status);
                    const errorText = await response.text();
                    console.error("Error details: ", errorText);
                }
                return returnedBooks;
            } else {
                console.error("error uploading image: ", titles.status);
                const errorText = await titles.text();
                console.error("Error details: ", errorText);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    // returns a Book object from json given by google books
    const jsonToBook = (bookjson: apiReturn) => {
        const returnBook: Book = {
            id: `tempid${Math.floor(Math.random() * 1000)}`,
            isbn: bookjson.isbn,
            title: bookjson.title,
            author: bookjson.authors,
            excerpt: bookjson.excerpt,
            summary: bookjson.summary,
            image: bookjson.thumbnail,
            pageCount: bookjson.page_count,
            publishedDate: bookjson.published_date,
            publisher: bookjson.publisher,
            // rating: bookjson.rating, (cant do rating like this)
            isFavorite: false,
        }
        return returnBook;
    }

    return (
        <Modal animationType="fade" transparent visible={!userChoosing}>
            <TouchableWithoutFeedback onPress={closeModal} disabled={isProcessing}>
                <View className="flex-1 justify-center items-center">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-lg w-64 p-4 space-y-4">
                            {isProcessing && <ActivityIndicator size='large' color='#0000ff' />}
                            <Pressable
                                onPress={handleTakePicture}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-blue-500`}
                                testID="takePictureButton"
                            >
                                <Text className="text-white">Take Picture of single book</Text>
                            </Pressable>
                            <Pressable
                                onPress={handlePickImage}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-blue-500`}
                                testID="pickPhotoButton"
                            >
                                <Text className="text-white">Upload image of a single book</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleTakeShelfPicture}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-blue-500`}
                            >
                                <Text className="text-white">Take Picture of a book shelf</Text>
                            </Pressable>
                            <Pressable
                                onPress={handlePickShelfImage}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-blue-500`}
                            >
                                <Text className="text-white">Upload image of a book shelf</Text>
                            </Pressable>
                            <Pressable
                                onPress={closeModal}
                                className="p-2 bg-red-500 rounded items-center"
                                disabled={isProcessing}>
                                <Text className="text-white">Cancel</Text>
                            </Pressable>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CameraModal;
