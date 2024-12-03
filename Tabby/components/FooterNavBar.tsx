import { View, Pressable, Text, Modal, FlatList, Alert, ScrollView } from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
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
import BookSearchPreview from "@/components/BookSearchPreview";

let tempBooks: Book[] = [];

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [isBookSelectionModalVisible, setBookSelectionModalVisible] = useState(false);
  const [chosenCategory, setChosenCategory] = useState('')
  const [categories, setCategories] = useState<String[]>([]);
  const [selectedIsbn, setSelectedIsbn] = useState<String | String[] | undefined>(undefined);
  const [isShelf, setIsShelf] = useState(false);
  const pathname = usePathname();

  const size = 40;

  const router = useRouter();

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

  const handleShelfPress = (isbn: string | undefined) => {
    if (!isbn) return;
    setSelectedIsbn((prev) => {
      if (prev?.includes(isbn) && Array.isArray(prev)) {
        return prev.filter((item) => item !== isbn);
      } else {
        if (Array.isArray(prev))
          return [...prev, isbn];
      }
    })
  }

  const renderItem = ({ item }: { item: Book }) => {
    let isSelected = false;
    if (isShelf && item.isbn && selectedIsbn) {
      isSelected = selectedIsbn.includes(item.isbn);
    } else {
      isSelected = item.isbn === selectedIsbn;
    }

    return (
      <Pressable
        onPress={() => {
          if (!isShelf) {
            console.log("Book selected:", item);
            handlePress(item.isbn);
          } else {
            if (!selectedIsbn) {
              const temp: String[] = [];
              setSelectedIsbn(temp);
            }
            handleShelfPress(item.isbn);
          }

        }}
        className={`flex-row items-center p-4 rounded-lg my-1 ${isSelected ? 'bg-blue-500 opacity-80' : ''}`}
      >
        <BookSearchPreview book={item} />
      </Pressable>
    )
  }

  // add book to a category
  const addBookToCategory = async () => {
    if (chosenCategory === '') {
      Alert.alert("Please Select a category to add this book");
      return;
    }
    if (selectedIsbn === undefined) {
      Alert.alert('Please Select a book to add');
      return;
    }

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
      if (Array.isArray(selectedIsbn)) {
        if (item.isbn && selectedIsbn.includes(item.isbn)) {
          returnBook = item;
          returnBook.category = chosenCategory;
          await addUserBook(returnBook);
        }
      } else {
        if (item.isbn === selectedIsbn) {
          returnBook = item;
          returnBook.category = chosenCategory;
          await addUserBook(returnBook);
        }
      }
    }

    if (pathname.includes(`/library/${chosenCategory}`)) {
      router.push(`/library/${chosenCategory}`);
    }

    setBookSelectionModalVisible(false);
    setChosenCategory('');
    setSelectedIsbn(undefined);
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

      <Link href="/settings" asChild>
        <Pressable className="flex-col mx-auto">
          <Settings />
          <Text className="text-center text-white">Settings</Text>
        </Pressable>
      </Link>

      {/* Camera Modal */}
      {isCameraModalVisible && (
        <CameraModal closeModal={() => setCameraModalVisible(false)}
          onBookSelectionStart={(returnedBooks: Book[], isShelf: boolean) => {
            tempBooks = returnedBooks;
            fetchCategories();
            setCameraModalVisible(false);
            setBookSelectionModalVisible(true);
            setIsShelf(isShelf)
          }} />
      )}
      {isBookSelectionModalVisible && tempBooks.length > 0 && (
        <Modal animationType="slide" transparent visible>
          <View className="flex-1 justify-center items-center bg-opacity-50">
            <View className="bg-white rounded-lg w-80 p-4 space-y-4 truncate">
              {isShelf ? <Text className="text-lg font-bold text-center">Select the correct books</Text> : <Text className="text-lg font-bold text-center">Select the correct book</Text>}

              <FlatList
                className="max-h-56"
                data={tempBooks}
                keyExtractor={(item) => item.id + item.isbn}
                renderItem={renderItem}
              />

              <ScrollView className="max-h-56">
                <SelectList
                  setSelected={(val: string) => setChosenCategory(val)}
                  data={categories}
                  search={false}
                  onSelect={() => console.log('user chose: ', chosenCategory)}
                  placeholder={isShelf ? 'Select which category to add these books' : 'Select which category to add this book'}
                />
              </ScrollView>

              <Pressable
                onPress={() => addBookToCategory()}
                className="p-2 bg-blue-500 rounded items-center"
              >
                <Text className="text-white">Confirm</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setBookSelectionModalVisible(false);
                  setChosenCategory('');
                  setSelectedIsbn(undefined);
                }}
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
