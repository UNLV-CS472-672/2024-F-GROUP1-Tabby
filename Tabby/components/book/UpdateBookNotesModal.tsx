import { Modal, View, Text, TextInput, Pressable, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";

interface UpdateBookNotesModalProps {
    visible: boolean;
    notes: string;
    onClose: () => void;
    onUpdateNotes: (newNotes: string) => void;
}

const UpdateBookNotesModal = ({ visible, notes, onClose, onUpdateNotes }: UpdateBookNotesModalProps) => {
    const [newNotes, setNewNotes] = useState(notes);

    const handleSave = () => {

        onUpdateNotes(newNotes);
        onClose();
    };

    return (

        <Modal visible={visible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-center items-center">
                    <TouchableWithoutFeedback >
                        <View className="bg-white p-5 w-4/5 rounded-lg">

                            <Text className="text-lg text-black">Update Notes</Text>
                            <TextInput
                                value={newNotes}
                                onChangeText={setNewNotes}
                                placeholder="Enter new notes"
                                multiline
                                textAlignVertical="top"
                                className="h-24 border border-gray-300 rounded-md mb-4 p-2 text-black"
                                autoFocus={true}
                            />
                            <Pressable onPress={handleSave} className="bg-blue-500 py-2 rounded-md mb-2">
                                <Text className="text-white text-center">Save</Text>
                            </Pressable>
                            <Pressable onPress={onClose} className="bg-red-500 py-2 rounded-md">
                                <Text className="text-white text-center">Cancel</Text>
                            </Pressable>
                        </View>

                    </TouchableWithoutFeedback>

                </View>

            </TouchableWithoutFeedback>

        </Modal>
    );
};

export default UpdateBookNotesModal;
