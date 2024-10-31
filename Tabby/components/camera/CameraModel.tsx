import { View, Text, Pressable, Modal } from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { Camera, useCameraPermissions } from "expo-camera";

interface CameraModalProps {
    closeModal: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ closeModal }) => {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    // Function to take a picture and log the URI
    const handleTakePicture = async () => {
        if (!cameraPermission?.granted) {
            const { granted } = await requestCameraPermission();
            if (!granted) return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0]?.uri;
            console.log("Picture URI:", uri); // Log the URI
            closeModal();
        }
    };

    // Function to pick an image and log the URI
    const handlePickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0]?.uri;
            console.log("Picked Image URI:", uri); // Log the URI
            closeModal();
        }
    };

    return (
        <Modal animationType="fade" transparent visible>
            <BlurView intensity={50} tint="dark" className="flex-1 justify-center items-center">
                <View className="bg-[#1d232b] rounded-lg w-64 p-4 space-y-4">
                    <Pressable onPress={handleTakePicture} className="p-2 bg-white rounded items-center">
                        <Text className="text-black">Take Picture</Text>
                    </Pressable>
                    <Pressable onPress={handlePickImage} className="p-2 bg-white rounded items-center">
                        <Text className="text-black">Pick from Camera Roll</Text>
                    </Pressable>
                    <Pressable onPress={closeModal} className="p-2 bg-red-500 rounded items-center">
                        <Text className="text-white">Cancel</Text>
                    </Pressable>
                </View>
            </BlurView>
        </Modal>
    );
};

export default CameraModal;
