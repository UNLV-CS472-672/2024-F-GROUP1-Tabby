import React, { useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import StarIcon from "@/components/book/StarIcon";
type RateBookModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  currentRating: 0 | 1 | 2 | 3 | 4 | 5;
};

const RateBookModal: React.FC<RateBookModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  currentRating,
}) => {
  const [selectedRating, setSelectedRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(
    currentRating
  );

  const handleStarPress = (rating: 0 | 1 | 2 | 3 | 4 | 5) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    await onSubmit(selectedRating);
  };
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white rounded-lg p-6">
          <Text className="text-xl font-bold text-center mb-4">
            Rate the Book
          </Text>
          <View className="flex-row justify-center items-center mb-6">
            <View className="flex-row justify-center space-x-1 my-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <Pressable
                  className="p-1"
                  key={item}
                  onPress={() => handleStarPress(item as 0 | 1 | 2 | 3 | 4 | 5)}
                >
                  <StarIcon
                    isRated={item <= selectedRating} // Render filled stars up to the selected rating
                    height={30}
                    width={30}
                  />
                </Pressable>
              ))}
            </View>
          </View>
          <View className="flex-row justify-between">
            <Pressable
              className="px-4 bg-blue-500 py-2 rounded-md"
              onPress={handleSubmit}
            >
              <Text className="text-center text-white">Submit</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              <Text className="text-center text-black">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RateBookModal;
