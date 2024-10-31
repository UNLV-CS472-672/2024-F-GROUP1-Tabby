import { useCameraPermissions } from "expo-camera";
import { Text, TouchableOpacity, View, Modal, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { Image } from "expo-image"
import { BlurView } from 'expo-blur';
import Camera from "@/assets/navbar-images/camera.svg";
import * as ImagePicker from "expo-image-picker";

export default function CameraButton() {
  const [permission, requestPermission] = useCameraPermissions();
  const [visibleModal, setVisibleModal] = useState(false);

  let checkPermissions = () => {
    if (permission && !permission.granted) {
      // Camera permissions are not granted yet.
      return (
        <SafeAreaView className="content-center flex-1">
          <Text className="text-center pb-2.5">
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </SafeAreaView>
      );
    }
    setVisibleModal(!visibleModal);
  };

  // lets the user take a new picture
  let takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    // if they didnt cancel then close the camera screen
    if (!result.canceled) {
      setVisibleModal(!visibleModal);
    }
  };

  // lets user pick an image from their camera roll
  let pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    // if they didnt cancel then close the camera screen
    if (!result.canceled) {
      setVisibleModal(!visibleModal);
    }
  };

  return (
    <View>
        <TouchableOpacity onPress={checkPermissions} className="flex-1">
            <Camera height={40} width={40}/>
        </TouchableOpacity>
        <Modal animationType="fade" transparent={true} visible={visibleModal}>
            <BlurView intensity={50} tint="dark" experimentalBlurMethod="dimezisBlurView" className="flex-1 w-screen h-screen">
                <SafeAreaView className="items-center justify-center flex-1">
                    <View className="absolute z-10 justify-center rounded-lg flex-col space-y-8 w-48 max-h-64 bg-[#1d232b]">
                        <TouchableOpacity onPress={takePicture} className='flex items-center'>
                            <Text className="text-white">Take Picture</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={pickImage} className='flex items-center'>
                            <Text className="text-white">Use image from camera roll</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setVisibleModal(!visibleModal)} className='flex items-center'>
                            <Text className="text-white">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setVisibleModal(!visibleModal)} className="z-0 w-screen h-screen"/>
                </SafeAreaView>   
            </BlurView>
        </Modal>
    </View>
   
  );
}
