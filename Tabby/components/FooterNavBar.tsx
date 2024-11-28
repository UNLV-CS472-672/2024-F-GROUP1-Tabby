import { View, Pressable, Text, Modal, FlatList, Image } from "react-native";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { SelectList } from 'react-native-dropdown-select-list'
import SelectedLibrary from "@/components/navbar/selectedLibrary";
import NotSelectedLibrary from "@/components/navbar/notSelectedLibrary";
import SelectedExplore from "@/components/navbar/selectedExplore";
import NotSelectedExplore from "@/components/navbar/notSelectedExplore";
import SelectedFavorite from "@/components/navbar/selectedFavorite";
import NotSelectedFavorite from "@/components/navbar/notSelectedFavorite";
import Settings from "@/components/navbar/settings";
import CameraIcon from "@/components/navbar/camera";
import CameraModal from "@/components/camera/CameraModel";
import { Book } from '@/types/book';

let tempBooks: Book[] = [];
const tempCategories: String[] = ['Fiction', 'Non-Fiction', 'Comedy', 'Narrative', 'Mystery', 'Science Fiction', 'Thriller', 'Biography', 'Poetry'];

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [isBookSelectionModalVisible, setBookSelectionModalVisible] = useState(false);
  const [chosenCategory, setChosenCategory] = useState('')
  const pathname = usePathname();
  const size = 40;

  return (
    <View className="flex-row bg-[#1d232b] w-full py-1 justify-around">
      <Link href="/library" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/library") ? (
            <SelectedLibrary height={size} width={size} />
          ) : (
            <NotSelectedLibrary height={size} width={size} />
          )}
          <Text className="text-center text-white">Library</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable className="flex-col mx-auto">
          {pathname.includes("/recommendations") ? (
            <SelectedExplore />
          ) : (
            <NotSelectedExplore />
          )}
          <Text className="text-center text-white">Explore</Text>
        </Pressable>
      </Link>

      {/* Camera Button to show camera modal */}
      <Pressable testID="CameraButton" onPress={() => setCameraModalVisible(true)} className="flex-col mx-auto">
        <View className="w-16 h-16 items-center justify-center">
          <CameraIcon />
        </View>
      </Pressable>

      <Link href="/favorites" asChild>
        <Pressable testID="favoritesButton" className="flex-col mx-auto">
          {pathname.includes("/favorites") ? (
            <SelectedFavorite />
          ) : (
            <NotSelectedFavorite />
          )}
          <Text className="text-center text-white">Liked</Text>
        </Pressable>
      </Link>

      <Link href="/setting" asChild>
        <Pressable className="flex-col mx-auto">
          <Settings />
          <Text className="text-center text-white">Settings</Text>
        </Pressable>
      </Link>

      {/* Camera Modal */}
      {isCameraModalVisible && (
        <CameraModal closeModal={() => setCameraModalVisible(false)}
          onBookSelectionStart={(returnedBooks: Book[]) => {
            tempBooks = returnedBooks;
            setCameraModalVisible(false);
            setBookSelectionModalVisible(true);
          }} />
      )}
      {/*TODO: - Let user choose book then click on confirm button
               - Change logic for when books have duplicate keys(isbns)
               - Get Categories from database
               - Add book to database */}
      {isBookSelectionModalVisible && (
        <Modal animationType="slide" transparent visible>
          <View className="flex-1 justify-center items-center  bg-opacity-50">
            <View className="bg-white rounded-lg w-80 p-4 space-y-4 truncate">
              <Text className="text-lg font-bold text-center">Select the correct book</Text>
              <FlatList
                data={tempBooks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      console.log("Book selected:", item);
                      // TODO: add selection logic here
                      // setBookSelectionModalVisible(false); // Close after selection
                    }}
                    className="p-2 border rounded-lg mb-2 h-32 flex-row"
                  >
                    {/* TODO: if no image make default image*/}
                    <Image source={{ uri: item.image }} className='w-1/4 h-full' />
                    <View className="flex-col h-32 flex-1 truncate">
                      <Text className="text-center">{item.title}</Text>
                      <Text className='text-center'>{item.author}</Text>
                      <Text className='text-center truncate'>{item.summary}</Text>
                    </View>
                  </Pressable>
                )}
              />
              <SelectList
                setSelected={(val: string) => setChosenCategory(val)}
                data={tempCategories}
                search={false}
                onSelect={() => console.log('user chose: ', chosenCategory)}
                placeholder={'Select which category to add this book'}
              />
              <Pressable
                // TODO: add selected book to database
                onPress={() => setBookSelectionModalVisible(false)}
                className="p-2 bg-blue-500 rounded items-center"
              >
                <Text className="text-white">Confirm</Text>
              </Pressable>
              <Pressable
                onPress={() => setBookSelectionModalVisible(false)}
                className="p-2 bg-red-500 rounded items-center"
              >
                <Text className="text-white">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )
      }
    </View >
  );
};

export default FooterNavBar;
