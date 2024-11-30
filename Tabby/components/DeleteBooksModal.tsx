import { useState } from 'react';
import { Modal, Pressable, FlatList, View, Text } from 'react-native';
import { Book } from '@/types/book';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DeleteBooksModalProps {
    visible: boolean;
    onClose: () => void;
    booksToDelete: Book[];
    onConfirm: () => Promise<void>;
}

const DeleteBooksModal: React.FC<DeleteBooksModalProps> = ({
    visible,
    onClose,
    booksToDelete,
    onConfirm,
}) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
        } catch (error) {
            console.error('Error deleting books:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable className='flex-1' onPress={onClose}>
            </Pressable>
            <View
                className="p-4 m-4 bg-white rounded-lg z-10 "
            >
                <Text className="text-lg text-center font-bold text-black mb-4">
                    Are you sure you want to delete the following books?

                </Text>
                <FlatList

                    className='max-h-52'
                    data={booksToDelete}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Text className="text-sm text-gray-800 mb-2">• {item.title}</Text>
                    )}
                />

                {loading ? (
                    <View className='w-full h-20'>
                        <LoadingSpinner />
                    </View>
                ) : <View className="flex-row justify-between mt-4">
                    <Pressable
                        className="px-4 py-2 bg-red-500 rounded-lg"
                        onPress={handleConfirm}
                    >
                        <Text className="text-white">Delete</Text>
                    </Pressable>
                    <Pressable
                        className="px-4 py-2 mr-2 bg-gray-300 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-black">Cancel</Text>
                    </Pressable>
                </View>}



            </View>

            <Pressable className='flex-1' onPress={onClose}></Pressable>
        </Modal>
    );
};

export default DeleteBooksModal;
