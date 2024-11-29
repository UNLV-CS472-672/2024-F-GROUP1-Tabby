import { View, Pressable, Text, Modal, FlatList, Image } from "react-native";
import { Link, usePathname } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { Category } from '@/types/category';
import { getAllCategories, addUserBook } from '@/database/databaseOperations';

let tempBooks: Book[] = [];

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [isBookSelectionModalVisible, setBookSelectionModalVisible] = useState(false);
  const [chosenCategory, setChosenCategory] = useState('')
  const [categories, setCategories] = useState<String[]>([]);
  const [selectedIsbn, setSelectedIsbn] = useState<String | undefined>(undefined);
  const pathname = usePathname();
  const size = 40;

  useEffect(() => {
    fetchCategories();
  }, [])

  const fetchCategories = async () => {
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories);
  }

  // returns names of all categories
  const getCategories = async () => {
    let categoryNames: String[] = [];
    const givenCategories: Category[] | null = await getAllCategories();
    if (givenCategories) {
      for (const item of givenCategories) {
        await categoryNames.push(item.name);
      }
    }
    return categoryNames;
  }

  // when a book is selected as correct book mark selected isbn as its isbn
  const handlePress = (isbn: string | undefined) => {
    setSelectedIsbn(isbn);
  };

  const renderItem = ({ item }: { item: Book }) => {
    const isSelected = item.isbn === selectedIsbn;

    return (
      <Pressable
        onPress={() => {
          console.log("Book selected:", item);
          handlePress(item.isbn);
        }}
        className={`p-2 border rounded-lg mb-2 h-32 flex-row truncate ${isSelected ? "bg-blue-500" : "bg-white"}`}
      >
        {/* TODO: if no image make default image*/}
        <Image source={{ uri: item.image }} className='w-1/4 h-full' />
        <View className="flex-col h-32 flex-1 truncate">
          <Text className="text-center">{item.title}</Text>
          <Text className='text-center'>{item.author}</Text>
          <Text className='text-center truncate'>{item.summary}</Text>
        </View>
      </Pressable>
    )
  }

  // add book to a category
  const addBookToCategory = () => {
    let returnBook: Book = {
      id: "tempID",
      title: "temptitle",
      author: "tempauthor",
      excerpt: "tempexcerpt",
      summary: "tempsummary",
      image: "tempimage",
      isFavorite: false,
    };
    for (const item of tempBooks) {
      if (item.isbn === selectedIsbn) {
        returnBook = item;
      }
    }
    returnBook.category = chosenCategory;

    addUserBook(returnBook);
    setBookSelectionModalVisible(false);
  }

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
            fetchCategories();
            setCameraModalVisible(false);
            setBookSelectionModalVisible(true);
          }} />
      )}
      {isBookSelectionModalVisible && (
        <Modal animationType="slide" transparent visible>
          <View className="flex-1 justify-center items-center  bg-opacity-50">
            <View className="bg-white rounded-lg w-80 p-4 space-y-4 truncate">
              <Text className="text-lg font-bold text-center">Select the correct book</Text>
              <FlatList
                data={tempBooks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
              />
              <SelectList
                setSelected={(val: string) => setChosenCategory(val)}
                data={categories}
                search={false}
                onSelect={() => console.log('user chose: ', chosenCategory)}
                placeholder={'Select which category to add this book'}
              />
              <Pressable
                onPress={() => addBookToCategory()}
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
