import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Camera, useCameraPermissions } from "expo-camera";

interface CameraModalProps {
    closeModal: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ closeModal }) => {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    // use to disable the buttons temporarily when clicking them to prevent multiple clicks
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle taking a picture by requesting permissions before taking the picture if necessary
    const handleTakePicture = async () => {
        setIsProcessing(true);
        if (!cameraPermission?.granted) {
            const { granted } = await requestCameraPermission();
            if (!granted) {
                setIsProcessing(false);
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        setIsProcessing(false);
        if (!result.canceled) closeModal();
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        setIsProcessing(false);
        if (!result.canceled) closeModal();
    };

    return (
        <Modal animationType="fade" transparent visible>
            <TouchableWithoutFeedback onPress={closeModal}>
                <View className="flex-1 justify-center items-center">
                    <TouchableWithoutFeedback>
                        <View className="bg-[#1d232b] rounded-lg w-64 p-4 space-y-4">
                            <Pressable
                                onPress={handleTakePicture}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-white`}
                            >
                                <Text className="text-black">Take Picture</Text>
                            </Pressable>
                            <Pressable
                                onPress={handlePickImage}
                                disabled={isProcessing}
                                className={`p-2 rounded items-center bg-white`}
                            >
                                <Text className="text-black">Pick from Camera Roll</Text>
                            </Pressable>
                            <Pressable onPress={closeModal} className="p-2 bg-red-500 rounded items-center">
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
