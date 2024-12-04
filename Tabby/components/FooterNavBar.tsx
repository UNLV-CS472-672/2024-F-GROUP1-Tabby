import { View, Pressable, Text, Modal, FlatList, Alert } from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import SelectedLibrary from "@/components/navbar/selectedLibrary";
import NotSelectedLibrary from "@/components/navbar/notSelectedLibrary";
import SelectedExplore from "@/components/navbar/selectedExplore";
import NotSelectedExplore from "@/components/navbar/notSelectedExplore";
import SelectedFavorite from "@/components/navbar/selectedFavorite";
import NotSelectedFavorite from "@/components/navbar/notSelectedFavorite";
import Settings from "@/components/navbar/settings";
import CameraIcon from "@/components/navbar/camera";
import CameraModal from "@/components/camera/CameraModal";
import { Book } from '@/types/book';
import { Checkbox } from 'expo-checkbox';
import { Category } from '@/types/category';
import { getAllCategories, addMultipleUserBooksWithCategoryName } from '@/database/databaseOperations';
import BookSearchPreview from "@/components/BookSearchPreview";

let tempBooks: Book[] = [];

const FooterNavBar = () => {
  // set to true to show camera modal
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [isBookSelectionModalVisible, setBookSelectionModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedBooksByIsbn, setSelectedBooksByIsbn] = useState<string[]>([]);
  const [isShelf, setIsShelf] = useState(false);
  const pathname = usePathname();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const currentNestedSlug = pathname.split("/").pop();
  console.log("current nested slug: ", currentNestedSlug);
  const [bookErrorMessage, setBookErrorMessage] = useState<string>('');
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string>('');
  // Toggle selection of categories
  const toggleCategorySelection = (category: string) => {
    // reset error messages
    if (categoryErrorMessage.length > 0) setCategoryErrorMessage('');
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };


  const size = 40;

  const router = useRouter();

  useEffect(() => {
    const fetchCategoriesOnMount = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }

    fetchCategoriesOnMount();
  }, [])

  const fetchCategories = async () => {
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories);
  }

  // returns names of all categories
  const getCategories = async () => {
    let categoryNames: string[] = [];
    const givenCategories: Category[] | null = await getAllCategories();
    if (givenCategories) {
      for (const item of givenCategories) {
        await categoryNames.push(item.name);
      }
    }
    return categoryNames;
  }


  const handleShelfPressToSelectBooks = (isbn: string | undefined) => {
    if (!isbn) {
      console.log("no isbn");
      return;
    };
    // reset error messages
    setBookErrorMessage('');

    setSelectedBooksByIsbn((prev) => {
      if (prev?.includes(isbn)) {
        return prev.filter((item) => item !== isbn);
      } else {
        return [...prev, isbn];
      }
    })


  }

  const renderItem = ({ item }: { item: Book }) => {

    const isSelected = selectedBooksByIsbn?.includes(item.isbn || "default-isbn");

    return (
      <Pressable
        onPress={() => {
          console.log("Book selected:", item.title);
          handleShelfPressToSelectBooks(item.isbn);
        }}
        className={`flex-row items-center p-4 rounded-lg my-1 ${isSelected ? 'bg-blue-500 opacity-80' : ''}`}
      >
        <BookSearchPreview book={item} />
      </Pressable>
    )
  }

  // add selected books to a categories
  const addSelectedBooksToCategories = async () => {
    const areNoCategoriesSelected = selectedCategories.length === 0;
    const areNoBooksSelected = selectedBooksByIsbn.length === 0;
    if (areNoCategoriesSelected) {
      setCategoryErrorMessage('Please select at least one category.');
    }

    if (areNoBooksSelected) {
      setBookErrorMessage('Please select at least one book.');
    }
    console.log("is shelf: ", isShelf);
    // no categories or books selected so return
    if (areNoCategoriesSelected || areNoBooksSelected) {
      return;
    }


    let wasAbleToAddBooksToAllCategories = true;
    // filter selected books
    const selectedBookObjects = tempBooks.filter((item) => {
      if (item.isbn && selectedBooksByIsbn.includes(item.isbn)) {
        return true;
      } else {
        return false;
      }
    })
    console.log("\n\n \n\n \n selected book objects: ", selectedBookObjects, "\n \n\n \n\n \n\n \n");

    console.log("\n\n \n\n \n selected categories: ", selectedCategories, "\n \n\n \n\n \n\n \n");

    // for each category add the selected books
    for (const category of selectedCategories) {
      const resultOfAddingBooksToCurrentCategory = await addMultipleUserBooksWithCategoryName(
        selectedBookObjects,
        category
      );
      if (!resultOfAddingBooksToCurrentCategory) {
        console.error("Failed to add books to current category: ", category);
        wasAbleToAddBooksToAllCategories = false;
      }
    }

    if (wasAbleToAddBooksToAllCategories) {
      //reset local state of selectable books
      Alert.alert("Successfully added selected books to all selected categories");
    } else {
      console.error("Failed to add selected books to all categories");
    }

    // refresh current category page
    console.log("if there is category: ", currentNestedSlug);
    if (pathname.includes(`/library/${currentNestedSlug}`)) {
      // reset local state of selected categories
      setSelectedCategories([]);
      setSelectedBooksByIsbn([]);
      router.replace(`/library/${currentNestedSlug}`);
    }

    // do not close book modal when adding to categories as maybe user wants to select different books to add to different categories later they can close it themselves
    // reset local state of selected categories
    setSelectedCategories([]);
    setSelectedBooksByIsbn([]);
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
            // filter returned books by isbn only unique ISBNS
            const uniqueReturnedBooks = returnedBooks.filter((item, index, array) => {
              return array.findIndex(book => book.isbn === item.isbn) === index;
            });

            tempBooks = uniqueReturnedBooks;
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
              <Text className="text-xl font-bold text-center">Select The Correct Books</Text>


              {/* Book selection */}
              <FlatList
                className="max-h-56"
                data={tempBooks}
                keyExtractor={(item) => item.id + item.isbn}
                renderItem={renderItem}
              />


              {/* Category selection */}
              <Text className="text-xl font-bold text-center">Select Categories</Text>
              <FlatList
                className="max-h-36"
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => toggleCategorySelection(item)}
                    className="flex-row items-center mb-2 p-1"
                  >
                    <Checkbox
                      value={selectedCategories.includes(item)}
                      onValueChange={() => toggleCategorySelection(item)}
                    />
                    <Text className="ml-2 text-sm text-gray-800">{item}</Text>
                  </Pressable>
                )}
              />

              <View>
                {bookErrorMessage.length > 0 && <Text className="text-red-500 mb-1">{bookErrorMessage}</Text>}
                {categoryErrorMessage.length > 0 && <Text className="text-red-500 mb-1">{categoryErrorMessage}</Text>}
              </View>


              <Pressable
                onPress={() => addSelectedBooksToCategories()}
                className="p-2 bg-blue-500 rounded items-center"
              >
                <Text className="text-white">Confirm</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setBookSelectionModalVisible(false);
                  setSelectedCategories([]);
                  setSelectedBooksByIsbn([]);
                  // reset error messages
                  setBookErrorMessage('');
                  setCategoryErrorMessage('');
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
