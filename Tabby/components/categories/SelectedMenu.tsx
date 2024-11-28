import { View, Pressable, Text } from "react-native";
import React from "react";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import RenameIcon from "@/assets/menu-icons/rename-icon.svg";
import CancelIcon from "@/assets/menu-icons/cancel-icon.svg";

interface SelectedMenuProps {
  openDeleteModal: () => void;
  openRenameModal: () => void;
  openCancelModal: () => void;
}
const size = 36

const SelectedMenu: React.FC<SelectedMenuProps> = ({ openDeleteModal, openRenameModal, openCancelModal }) => {

  return (



    <View className="flex-row justify-around bg-[#161f2b] w-full border-t border-blue-900">
      <View className="">
        <Pressable className="flex-col items-center" onPress={openDeleteModal}>
          <DeleteIcon height={size} width={size} />
          <Text className="text-white text-sm">Delete </Text>
        </Pressable>
      </View>

      <View>
        <Pressable className="flex-col items-center" onPress={openRenameModal}>
          <RenameIcon height={size} width={size} />

          <Text className="text-white text-sm">Rename</Text>
        </Pressable>
      </View>

      <View>
        <Pressable className="flex-col items-center" onPress={openCancelModal}>
          <CancelIcon height={size} width={size} />
          <Text className="text-white text-sm">Cancel</Text>

        </Pressable>
      </View>

    </View>

  );
};

export default SelectedMenu;
