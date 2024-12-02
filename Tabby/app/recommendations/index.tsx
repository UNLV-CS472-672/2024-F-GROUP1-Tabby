import React, { useState, useEffect } from "react";
import { FlatList, Pressable, View, Text, Alert } from "react-native";
import BookPreview from "@/components/BookPreview";
import { SafeAreaView } from "react-native-safe-area-context";
import AddButtonIcon from "@/components/AddButtonIcon";
import { SearchBar } from "@rneui/themed";
import {
  getAllCategories,
  getAllRecommendedBooks,
  addRecommendedBookIfNotInRecommendationsBasedOnIsbn,
  addRecommendedBook,
  deleteMultipleRecommendedBooksByIds,
  addMultipleUserBooksWithCategoryName,
  updateMultipleRecommendedBooksToBeAddedToLibrary,
  getAllNonCustomUserBooks,
  deleteAllRecommendedBooks,
} from "@/database/databaseOperations";
import { Book } from "@/types/book";
import DeleteIcon from "@/assets/menu-icons/delete-icon.svg";
import AddSquareIcon from "@/assets/menu-icons/add-square-icon.svg";
import CancelIcon from "@/assets/menu-icons/cancel-icon.svg";
import DeleteBooksModal from "@/components/DeleteBooksModal";
import AddBooksOrMoveBooksToCategoryModal from "@/components/AddBooksOrMoveBooksToCategoryModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import WebIcon from "@/assets/menu-icons/web-icon.svg";
import RefreshIcon from "@/assets/menu-icons/refresh-icon.svg";
import SelectIcon from "@/assets/menu-icons/select-icon.svg";
import AddSearchResultsBooksModal from "@/components/AddSearchResultsBooksModal";
import axios from "axios";

type SelectableBook = {
  book: Book;
  isSelected: boolean;
};

// test data to send recommendations to and will use this to send recommendations to if user has no books
const defaultBooks: Book[] = [
  {
    id: "7",
    isbn: "9780593291468",
    title: "The Midnight Library",
    author: "Matt Haig",
    summary:
      "A thought-provoking and uplifting novel about a woman who explores alternate lives in a magical library, discovering the many versions of herself she could have lived.",
    excerpt:
      "Nora Seed finds herself in a library between life and death, where each book offers a different version of her life. Will she choose to return to life, or will she embrace the alternative paths she discovers?",
    image: "https://m.media-amazon.com/images/I/51GZysDO-QL._SY445_.jpg",
    genres: "Fiction, Fantasy, Philosophical Fiction",
    notes:
      "A novel that explores themes of regret, mental health, and the possibilities of life choices.",
    pageCount: 304,
    publisher: "Viking",
    publishedDate: "August 13, 2020",
    addToLibrary: true,
    isFavorite: false,
    rating: 4,
  },
  {
    id: "8",
    isbn: "9781250141807",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    summary:
      "A compelling murder mystery and coming-of-age novel set in the wild marshes of North Carolina, focusing on Kya, the mysterious 'Marsh Girl'.",
    excerpt:
      "Kya Clark has lived in isolation for most of her life, but when a murder takes place nearby, she is thrust into the center of a mystery.",
    image: "https://m.media-amazon.com/images/I/51fuXLP7k0L._SY445_.jpg",
    genres: "Fiction, Mystery, Literary Fiction, Thriller",
    notes:
      "A bestseller that combines mystery, romance, and a rich exploration of nature and loneliness.",
    pageCount: 384,
    publisher: "G.P. Putnam's Sons",
    publishedDate: "August 14, 2018",
    addToLibrary: true,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "9",
    isbn: "9780385544797",
    title: "Project Hail Mary",
    author: "Andy Weir",
    summary:
      "A gripping science fiction novel about a lone astronaut who wakes up on a spaceship with no memory of who he is or how he got there, tasked with saving Earth from an extinction-level disaster.",
    excerpt:
      "Ryland Grace is the only survivor of a mission to save humanity, but he must piece together the puzzle of his situation while working against time and the unknown.",
    image: "https://m.media-amazon.com/images/I/41oyt8FQ0JL._SY445_.jpg",
    genres: "Science Fiction, Thriller, Space Opera",
    notes:
      "From the author of 'The Martian', a fast-paced and suspenseful adventure full of science, humor, and human resilience.",
    pageCount: 496,
    publisher: "Ballantine Books",
    publishedDate: "May 4, 2021",
    addToLibrary: true,
    isFavorite: false,
    rating: 4,
  },
  {
    id: "10",
    isbn: "9781984899379",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    summary:
      "A captivating novel about a reclusive Hollywood icon who tells her life story to a young journalist, revealing secrets, heartbreak, and the complexities of love and fame.",
    excerpt:
      "Evelyn Hugo, now in her 80s, opens up about her tumultuous life, including her seven marriages and the woman who changed everything.",
    image: "https://m.media-amazon.com/images/I/51V6tllsY0L._SY445_.jpg",
    genres: "Historical Fiction, Romance, Drama",
    notes:
      "A dazzling tale of fame, love, and the price of secrets in the glamorous world of old Hollywood.",
    pageCount: 400,
    publisher: "Atria Books",
    publishedDate: "June 13, 2017",
    addToLibrary: false,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "11",
    isbn: "9780142424179",
    title: "The Fault in Our Stars",
    author: "John Green",
    summary:
      "A heart-wrenching love story about two teenagers with cancer, exploring themes of life, death, and the impact we have on others.",
    excerpt:
      "Hazel Grace Lancaster and Augustus Waters fall in love after meeting at a cancer support group, and their love story is full of humor, heartbreak, and profound truths.",
    image: "https://m.media-amazon.com/images/I/41Ynm99Im7L._SY445_.jpg",
    genres: "Young Adult, Romance, Drama, Contemporary Fiction",
    notes:
      "A bestselling, emotionally charged novel that has resonated with readers around the world.",
    pageCount: 313,
    publisher: "Dutton Books",
    publishedDate: "January 10, 2012",
    addToLibrary: true,
    isFavorite: false,
    rating: 4,
  },
  {
    id: "12",
    isbn: "9780062457738",
    title: "Circe",
    author: "Madeline Miller",
    summary:
      "A modern retelling of the Greek myth of Circe, a powerful witch who is banished to an island, discovering her own strength and capacity for love.",
    excerpt:
      "Circe, once a minor character in the Odyssey, takes center stage in this beautifully written and thought-provoking novel of power, isolation, and transformation.",
    image: "https://m.media-amazon.com/images/I/41NF6ZT22hL._SY445_.jpg",
    genres: "Fantasy, Mythology, Historical Fiction",
    notes:
      "A bestselling novel that blends Greek mythology with a modern sensibility and a deep exploration of identity and autonomy.",
    pageCount: 393,
    publisher: "Little, Brown and Company",
    publishedDate: "April 10, 2018",
    addToLibrary: false,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "13",
    isbn: "9780452295294",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    summary:
      "A compelling overview of human history, from the emergence of Homo sapiens to the present day, examining how culture, science, and technology shaped our world.",
    excerpt:
      "Harari explores the history of humanity in a way that challenges conventional wisdom, discussing everything from the invention of agriculture to the digital revolution.",
    image: "https://m.media-amazon.com/images/I/41sdGVh4uKL._SY445_.jpg",
    genres: "Non-fiction, History, Anthropology",
    notes:
      "A critically acclaimed and thought-provoking exploration of human history, science, and philosophy.",
    pageCount: 443,
    publisher: "Harvill Secker",
    publishedDate: "February 4, 2015",
    addToLibrary: true,
    isFavorite: false,
    rating: 4,
  },
  // New Books Added
  {
    id: "14",
    isbn: "9780062315007",
    title: "Becoming",
    author: "Michelle Obama",
    summary:
      "The inspiring memoir of the former First Lady of the United States, recounting her life from childhood to the White House and beyond.",
    excerpt:
      "Michelle Obama's personal journey reflects her experiences as a mother, wife, and political figure, and her insights on leadership, family, and values.",
    image: "https://m.media-amazon.com/images/I/51N0H0e88oL._SY445_.jpg",
    genres: "Memoir, Non-fiction, Biography",
    notes:
      "A powerful and motivational memoir that resonates with readers of all ages, offering a glimpse into the life of one of the most influential women of our time.",
    pageCount: 448,
    publisher: "Crown Publishing Group",
    publishedDate: "November 13, 2018",
    addToLibrary: true,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "15",
    isbn: "9780385695242",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    summary:
      "A magical and mysterious tale of two rival magicians who create a circus that becomes the center of their intense, intricate competition.",
    excerpt:
      "The circus is open only at night, and its performers are bound by a magical competition with high stakes. This novel is a beautiful, whimsical journey through a fantastical world.",
    image: "https://m.media-amazon.com/images/I/41P4t9hFSOL._SY445_.jpg",
    genres: "Fantasy, Magical Realism, Romance",
    notes:
      "A lyrical, atmospheric novel filled with rich descriptions and captivating characters, perfect for fans of magical realism.",
    pageCount: 387,
    publisher: "Doubleday",
    publishedDate: "September 13, 2011",
    addToLibrary: true,
    isFavorite: true,
    rating: 4,
  },
  {
    id: "16",
    isbn: "9780143127741",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    summary:
      "A no-nonsense self-help book that challenges traditional ideas about happiness and success, encouraging readers to embrace life’s difficulties and focus on what really matters.",
    excerpt:
      "Mark Manson emphasizes that we often give too many f*cks about unimportant things. Instead, we should focus on the things that truly make us happy and fulfilled.",
    image: "https://m.media-amazon.com/images/I/41vqOXqR9pL._SY445_.jpg",
    genres: "Self-help, Personal Development",
    notes:
      "A candid and refreshing approach to personal growth, this book has become a bestseller worldwide.",
    pageCount: 224,
    publisher: "HarperOne",
    publishedDate: "September 13, 2016",
    addToLibrary: true,
    isFavorite: false,
    rating: 4,
  },
  {
    id: "17",
    isbn: "9780142424179",
    title: "Educated",
    author: "Tara Westover",
    summary:
      "A gripping memoir about a woman who grows up in a strict, survivalist family in rural Idaho, and her journey toward education and independence.",
    excerpt:
      "Tara Westover’s incredible story of overcoming the constraints of her upbringing, navigating trauma, and finding her own voice is both inspiring and heartbreaking.",
    image: "https://m.media-amazon.com/images/I/51rB2r6e+9L._SY445_.jpg",
    genres: "Memoir, Non-fiction",
    notes:
      "A powerful memoir that reflects on the importance of education and self-determination in overcoming adversity.",
    pageCount: 334,
    publisher: "Random House",
    publishedDate: "February 20, 2018",
    addToLibrary: false,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "18",
    isbn: "9780525432419",
    title: "Little Fires Everywhere",
    author: "Celeste Ng",
    summary:
      "Set in a suburban community, this novel explores the complex relationships between a mother-daughter duo and the family they become entangled with, tackling race, privilege, and family secrets.",
    excerpt:
      "When Mia Warren enters the seemingly perfect lives of the Richardson family, she sets off a chain of events that changes everyone involved.",
    image: "https://m.media-amazon.com/images/I/51TxHjkH74L._SY445_.jpg",
    genres: "Fiction, Contemporary Fiction, Drama",
    notes:
      "A gripping, layered narrative that deals with themes of identity, family, and the clash of different socio-economic realities.",
    pageCount: 338,
    publisher: "Penguin Press",
    publishedDate: "September 12, 2017",
    addToLibrary: false,
    isFavorite: true,
    rating: 4,
  },
  {
    id: "19",
    isbn: "9780525562941",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    summary:
      "A psychological thriller about a woman who shoots her husband in the face and then falls silent, leaving a psychotherapist to unravel the mystery behind her silence.",
    excerpt:
      "The story follows Theo, a psychotherapist who becomes obsessed with uncovering the truth about Alicia Berenson, a famous painter who murdered her husband.",
    image: "https://m.media-amazon.com/images/I/51TxHjkH74L._SY445_.jpg",
    genres: "Thriller, Mystery, Psychological Fiction",
    notes:
      "A suspenseful, twist-filled thriller that has become a global bestseller.",
    pageCount: 336,
    publisher: "Celadon Books",
    publishedDate: "February 5, 2019",
    addToLibrary: false,
    isFavorite: true,
    rating: 5,
  },
  {
    id: "20",
    isbn: "9781984824560",
    title: "Anxious People",
    author: "Fredrik Backman",
    summary:
      "A humorous yet poignant novel about a failed bank robber who inadvertently takes a group of strangers hostage at an apartment viewing, leading to unexpected connections and self-discovery.",
    excerpt:
      "What begins as a chaotic hostage situation quickly transforms into a story about human connection, vulnerability, and understanding.",
    image: "https://m.media-amazon.com/images/I/51Cgx4nd9JL._SY445_.jpg",
    genres: "Fiction, Contemporary Fiction, Humor",
    notes:
      "A beautifully written novel that combines humor, heartbreak, and introspection.",
    pageCount: 368,
    publisher: "Atria Books",
    publishedDate: "September 8, 2020",
    addToLibrary: true,
    isFavorite: true,
    rating: 4,
  }
];


const size = 36;
const maxLimitOfBooksToSendToServer = 100;
const maxLimitOfCharactersForSearch = 100;
const defaultUrl = "default-base-api-url";
// will initialize the base API URL with expo if not undefined otherwise use tests
const baseAPIUrlCpuForSearchAndRecommendationsInUS = process.env.EXPO_PUBLIC_CPU_US_API_URL || defaultUrl;
if (baseAPIUrlCpuForSearchAndRecommendationsInUS === defaultUrl) {
  console.error("baseAPIUrlCpuForSearchAndRecommendationsInUS is not set by env");
}
const convertApiResponseToBooks = (apiResponse: any): Book[] => {
  if (
    !apiResponse ||
    !apiResponse.results ||
    !Array.isArray(apiResponse.results)
  ) {
    throw new Error("Invalid API response format");
  }

  let idCounter = 1; // Counter starts at 1

  return apiResponse.results.map((item: any) => ({
    id: idCounter++, // Assign the current counter value and increment it
    isbn: item.isbn || "",
    title: item.title || "",
    author: item.authors || "",
    excerpt: item.excerpt || "",
    summary: item.summary || "",
    image: item.thumbnail || "",
    rating:
      item.rating !== undefined
        ? Math.min(5, Math.max(0, Math.round(item.rating))) // Ensure rating is between 0 and 5 and round to nearest integer
        : 0,
    genres: item.genres || "",
    publisher: item.publisher || "",
    publishedDate: item.published_date || "",
    pageCount: item.page_count || 0,
  }));
};

// function to  randomly shuffle an array
const shuffleArray = (array: any[]): any[] => {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const pickBooksToSendToServer = (books: Book[]): Book[] => {
  const uniqueBooksMap = new Map<string, Book>(); // Map to ensure unique books by ISBN

  // get unique books map by isbn to ensure no duplicates
  // First, process favorite books
  books.forEach((book) => {
    if (book.isFavorite && book.isbn && !uniqueBooksMap.has(book.isbn)) {
      uniqueBooksMap.set(book.isbn, book);
    }
  });

  // Then, process non-favorite books, ensuring no duplicates
  books.forEach((book) => {
    if (!book.isFavorite && book.isbn && !uniqueBooksMap.has(book.isbn)) {
      uniqueBooksMap.set(book.isbn, book);
    }
  });

  // Convert the map back to an array
  const uniqueBooks = Array.from(uniqueBooksMap.values());

  // If within the limit, return all unique books
  if (uniqueBooks.length <= maxLimitOfBooksToSendToServer) {
    return uniqueBooks;
  }

  // Filter books into favorites and non-favorites and only get unique books by isbn if it exists
  const favoriteBooks = uniqueBooks.filter((book) => book.isFavorite);
  const nonFavoriteBooks = uniqueBooks.filter((book) => !book.isFavorite);

  // Shuffle the books in each category to randomize the selection
  const shuffledFavoriteBooks = shuffleArray(favoriteBooks);
  const shuffledNonFavoriteBooks = shuffleArray(nonFavoriteBooks);

  let booksToSendToServer: Book[] = [];
  let favoriteBooksCounter = 0;
  let nonFavoriteBooksCounter = 0;

  // Select books up to the max limit, prioritizing favorites
  for (let i = 0; i < maxLimitOfBooksToSendToServer; i++) {
    if (favoriteBooksCounter < shuffledFavoriteBooks.length) {
      booksToSendToServer.push(shuffledFavoriteBooks[favoriteBooksCounter]);
      favoriteBooksCounter++;
    } else if (nonFavoriteBooksCounter < shuffledNonFavoriteBooks.length) {
      booksToSendToServer.push(shuffledNonFavoriteBooks[nonFavoriteBooksCounter]);
      nonFavoriteBooksCounter++;
    }
  }

  return booksToSendToServer;
};


// Get recommended books from the server
const getRecommendedBooksFromServerBasedOnBooksPassed = async (
  booksToUseForRecommendations: Book[]
): Promise<Book[]> => {
  const baseUrl = baseAPIUrlCpuForSearchAndRecommendationsInUS; // Ensure baseAPIUrlKoyeb is properly defined

  // if the booksToUseForRecommendations is empty send default books
  if (booksToUseForRecommendations.length === 0) {
    booksToUseForRecommendations = defaultBooks;
  }

  // pick limit of books to send to the server
  const limitedBooksToUseForRecommendations = pickBooksToSendToServer(
    booksToUseForRecommendations
  );

  // Extract the required data from the books array
  const titles = limitedBooksToUseForRecommendations.map((book) => book.title);

  const authors = limitedBooksToUseForRecommendations.map(
    (book) => book.author
  );

  const weights = limitedBooksToUseForRecommendations.map((book) => {
    // Base weight for books without ratings or favorites or if rating is 0
    if (!book.isFavorite && !book.rating || book.rating === 0) {
      return 0.1;
    }

    // Start with the weight 0
    let weight = 0;

    // Add weight for favorite books
    if (book.isFavorite) {
      weight += 0.5;
    }

    // Add weight based on the rating (1 adds 0.1, 2 adds 0.2, etc.)
    if (book.rating) {
      weight += book.rating * 0.1;
    }

    // Round weight to one decimal place and cap at 1.0
    return Math.min(1.0, Math.round(weight * 10) / 10);
  });
  console.log("titles \n\n\n\n: ", titles, "\n\n\n\n");

  console.log("weights \n\n\n\n: ", weights, "\n\n\n\n");

  console.log("LENGTH \n\n\n\n: ", weights.length, "\n\n\n\n");

  // Ensure all required parameters are present
  if (!titles || !authors || !weights) {
    console.error("Missing required fields in body for recommendations.");
    return [];
  }

  // Manually create URLSearchParams to encode the parameters

  const fullUrl = `${baseUrl}books/recommendations`;
  const body = {
    titles: [...titles],
    authors: [...authors],
    weights: [...weights],
  };

  try {
    // Use Axios params to handle URL encoding automatically
    const response = await axios.post(fullUrl, body);

    // Construct the full URL manually (without actually sending the request yet)

    // Check the response and convert results
    if (response.status === 200) {
      // Use the conversion function to return a Book array
      return convertApiResponseToBooks(response.data);
    } else {
      console.error("Unexpected response status:", response.status);
      return []; // Fallback to default books
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return []; // Fallback to default books
  }
};

const getBooksFromServerBasedOnSearch = async (
  search: string
): Promise<Book[]> => {
  const baseUrl = baseAPIUrlCpuForSearchAndRecommendationsInUS; // Ensure baseAPIUrlKoyeb is properly defined

  // Normalize the search string by removing dashes
  const normalizedSearch = search.replace(/-/g, "");

  // Regular expression to match ISBN-13 or ISBN-10
  const isbnRegex = /^(?:\d{10}|\d{13})$/;
  try {
    // Determine whether to search by ISBN or phrase
    const queryParam = isbnRegex.test(normalizedSearch)
      ? `isbn=${normalizedSearch}`
      : `phrase=${encodeURIComponent(search)}`;

    // Make the API call
    const fullUrl = `${baseUrl}books/search?${queryParam}`;

    const response = await axios.get(fullUrl);

    if (response.status === 200) {
      // Convert the API response to a Book array
      return convertApiResponseToBooks(response.data);
    } else {
      console.error("Unexpected response status:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching books from server:", error);
    return [];
  }
};

const Recommendations = () => {
  // State to keep track of books and their selected status
  const [selectableBooks, setSelectableBooks] = useState<SelectableBook[]>([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingBookModalVisible, setIsAddingBookModalVisible] = useState(
    false
  );
  const [
    isSearchResultsModalVisible,
    setIsSearchResultsModalVisible,
  ] = useState(false);
  const [
    pressedAddBookToLibraryButtonFromBookPreview,
    setPressedAddBookToLibraryButtonFromBookPreview,
  ] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);

  const [filteredBooksForSearchInRecommendations, setFilteredBooksForSearchInRecommendations] = useState(selectableBooks);
  const [loadingSearchInRecommendations, setLoadingSearchInRecommendations] = useState(false);
  // will add books that the user has searched for and selected to their library will be passed into search modal
  const handleAddSearchResultBooksFromApi = async (
    booksSelectedToAdd: Book[],
    categoriesSelected: string[]
  ) => {
    let wasAbleToAddAllBooksToAllCategories = true;

    try {
      // go through all categories adding books
      for (const category of categoriesSelected) {
        const resultOfAddingBooksToCurrentCategory = await addMultipleUserBooksWithCategoryName(
          booksSelectedToAdd,
          category
        );
        if (!resultOfAddingBooksToCurrentCategory) {
          wasAbleToAddAllBooksToAllCategories = false;
          console.error("Failed to add books to category: ", category);
        }
      }

      if (wasAbleToAddAllBooksToAllCategories) {
        Alert.alert("Successfully added all books to all categories");
        return true;
      }

      Alert.alert("Failed to add book to all categories");
      return false;
    } catch (error) {
      console.error("Error adding books to categories:", error);
      return false;
    }
  };

  // handle showing search results modal
  const handleShowSearchResultsModal = async () => {
    if (
      isSearchResultsModalVisible ||
      search.length === 0 ||
      search.length > maxLimitOfCharactersForSearch
    ) {
      Alert.alert(
        `Search must be between 1 and ${maxLimitOfCharactersForSearch} characters`
      );
      setSearch("");
      return;
    } else {
      setLoadingSearchResults(true);
      // get search results from api and show modal
      try {
        const booksSearchResults = await getBooksFromServerBasedOnSearch(
          search
        );
        // check if search results are empty
        if (booksSearchResults.length === 0) {
          Alert.alert("No results found for search");
        } else {
          setSearchResults(booksSearchResults);
          setIsSearchResultsModalVisible(true);
        }
      } catch (error) {
        console.error("Error getting search results from api", error);
      } finally {
        setLoadingSearchResults(false);
      }
    }
  };

  const handleClosingSearchResultsModal = () => {
    setIsSearchResultsModalVisible(false);
    // reset search results
    setSearchResults([]);
  };

  // function to check if any books are selected
  const areAnyFilteredBooksSelected = () => {
    return filteredBooksForSearchInRecommendations.some((book) => book.isSelected);
  };

  // get all selectable books that are selected
  const getSelectedSelectableFilteredBooks = () => {
    return filteredBooksForSearchInRecommendations.filter(
      (currentSelectableBook) => currentSelectableBook.isSelected
    );
  };

  // function to get all selected book ids
  const getAllSelectedFilteredBookIds = () => {
    return filteredBooksForSearchInRecommendations
      .filter((book) => book.isSelected)
      .map((book) => book.book.id);
  };

  // get all unselected Selectable book objects
  const getUnselectedSelectableBooks = () => {
    return selectableBooks.filter(
      (currentSelectableBook) => !currentSelectableBook.isSelected
    );
  };

  const refreshRecommendedBooksFromApi = async () => {
    try {
      setLoadingRecommendations(true);
      //getting all non custom user books
      const nonCustomUserBooks = await getAllNonCustomUserBooks();
      // getting recommended books based on non custom user books
      const recommendedBooksFromApi = await getRecommendedBooksFromServerBasedOnBooksPassed(
        nonCustomUserBooks || defaultBooks
      );

      // checking if the recommended books from api are empty
      if (recommendedBooksFromApi.length !== 0) {
        // delete all recommendations from database if there are some recommended books already 
        if (selectableBooks.length > 0) {
          const resultOfDeletingAllBooks = await deleteAllRecommendedBooks();
          if (!resultOfDeletingAllBooks) {
            throw new Error("Failed to delete all recommended books from database");
          }
        }


        // adding recommended books to database if not already in database
        for (const bookFromApi of recommendedBooksFromApi) {
          const resultOfAddingBook = await addRecommendedBook(
            bookFromApi
          );
          if (!resultOfAddingBook) {
            console.error("Failed to add book to database: ", bookFromApi);
          }
        }
      } else {
        throw new Error("No recommended books from api were found");
      }
      // replace old selectable books with new selectable books from api will also replace filtered books
      const selectableBooksToAdd = recommendedBooksFromApi.map(
        (book) => ({ book, isSelected: false })
      );
      setSearch("");
      setSelectableBooks([...selectableBooksToAdd]);
      setFilteredBooksForSearchInRecommendations([...selectableBooksToAdd]);
    } catch (error) {
      console.log("Error getting recommended books from api", error);
      Alert.alert("Error occurred while getting new recommended books");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const selectAllFilteredBooksAndUpdateSelectableBooksToSelectTheFilteredBooks = () => {
    // set all books to selected
    const updatedFilteredBooksForSearch = filteredBooksForSearchInRecommendations.map((book) => ({
      ...book,
      isSelected: true,
    }))


    const shouldSelectBook = (tempBook: SelectableBook) => {
      if (updatedFilteredBooksForSearch.some((filteredBook) => filteredBook.book.id === tempBook.book.id)) {
        return true;
      }
      return false;
    }

    // update selectable books
    const selectableBooksWithFilteredBooksSelected = selectableBooks.map((book) => ({
      ...book,
      isSelected: shouldSelectBook(book)

    }))
    setSelectableBooks(selectableBooksWithFilteredBooksSelected);
    setFilteredBooksForSearchInRecommendations(updatedFilteredBooksForSearch);
  }

  useEffect(() => {
    const addRecommendedBooksFromApiIfNoRecommendedBooks = async () => {
      try {
        //getting all non custom user books
        const nonCustomUserBooks = await getAllNonCustomUserBooks();
        // getting recommended books based on non custom user books
        const recommendedBooksFromApi = await getRecommendedBooksFromServerBasedOnBooksPassed(
          nonCustomUserBooks || defaultBooks
        );

        // checking if the recommended books from api are empty
        if (recommendedBooksFromApi.length !== 0) {
          // adding recommended books to database if not already in database
          for (const bookFromApi of recommendedBooksFromApi) {
            await addRecommendedBookIfNotInRecommendationsBasedOnIsbn(
              bookFromApi
            );
          }
        } else {
          throw new Error("No recommended books from api were found");
        }
        // add books from api to selectable books
        const selectableBooksToAdd = recommendedBooksFromApi.map((book) => ({
          book,
          isSelected: false,
        }));
        setSelectableBooks([
          ...selectableBooksToAdd,
        ]);
        setFilteredBooksForSearchInRecommendations([...selectableBooksToAdd]);
      } catch (error) {
        console.log("Error getting recommended books from api", error);
        Alert.alert("Error occurred while getting new recommended books");
        throw error;
      }
    };

    // Fetch books from the database when the component mounts
    const fetchBooksAndCategories = async () => {
      try {
        setLoadingRecommendations(true);

        // setting categories
        const initialCategories = await getAllCategories();
        if (Array.isArray(initialCategories)) {
          setCategories(initialCategories.map((category) => category.name));
        }

        // setting initial recommended books from database or from api if no recommended books
        const recommendedBooks = await getAllRecommendedBooks();
        if (recommendedBooks === null || recommendedBooks.length === 0) {
          await addRecommendedBooksFromApiIfNoRecommendedBooks();
        } else {
          setSelectableBooks(
            recommendedBooks.map((book) => ({ book, isSelected: false }))
          );
          setFilteredBooksForSearchInRecommendations(
            recommendedBooks.map((book) => ({ book, isSelected: false }))
          )
        }
      } catch (error) {
        // error getting recommended books from api so will just use old recommended books from earlier api calls
        console.log(error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchBooksAndCategories();
  }, []);

  const updateSearch = (search: string) => {
    const trimmedSearch = search.trim();
    setSearch(search);
    setLoadingSearchInRecommendations(true);
    const filteredBooks = selectableBooks.filter((currentSelectableBook) => {
      const genresAsArray = currentSelectableBook.book.genres?.split(",") || [];
      const searchAsLowerCase = trimmedSearch.toLowerCase();
      const filteredStringWithOnlyNumbers = trimmedSearch.replace(/\D/g, '');
      // search by title, author, genre, isbn, or genre
      if (
        search === "" ||
        currentSelectableBook.book.title.toLowerCase().includes(searchAsLowerCase) ||
        currentSelectableBook.book.author.toLowerCase().includes(searchAsLowerCase) ||
        genresAsArray.some((genre) => genre.toLowerCase().includes(searchAsLowerCase)) ||
        currentSelectableBook.book.isbn === filteredStringWithOnlyNumbers
      ) {
        return true;
      }
      return false;
    });

    const filteredBooksThatAreNotSelected = filteredBooks.map((currentFilteredBook) => {
      return {
        ...currentFilteredBook,
        isSelected: false
      }
    }
    )

    setFilteredBooksForSearchInRecommendations(filteredBooksThatAreNotSelected);

    setLoadingSearchInRecommendations(false);
  };

  // will change the state of the book to add to library
  const handleAddToLibraryPress = async (bookId: string) => {
    // pressed button multiple times
    if (pressedAddBookToLibraryButtonFromBookPreview) {
      return;
    } else {
      setPressedAddBookToLibraryButtonFromBookPreview(true);
    }
    // toggle book as selected this will update local state
    toggleSelectedBook(bookId);

    // open add books modal to add selected book
    setIsAddingBookModalVisible(true);
  };

  const toggleSelectedBook = (bookId: string) => {
    setSelectableBooks((prevSelectableBooks) =>
      prevSelectableBooks.map((currentSelectableBook) =>
        currentSelectableBook.book.id === bookId
          ? {
            ...currentSelectableBook,
            isSelected: !currentSelectableBook.isSelected,
          } // Toggle selected status
          : currentSelectableBook
      )
    );

    setFilteredBooksForSearchInRecommendations((prevSelectableBooks) =>
      prevSelectableBooks.map((currentSelectableBook) =>
        currentSelectableBook.book.id === bookId
          ? {
            ...currentSelectableBook,
            isSelected: !currentSelectableBook.isSelected,
          } // Toggle selected status
          : currentSelectableBook
      )
    );

  };

  // set all books to be deselected
  const deselectAllBooks = () => {
    setSelectableBooks((prevSelectableBooks) =>
      prevSelectableBooks.map((currentSelectableBook) => ({
        ...currentSelectableBook,
        isSelected: false,
      }))
    );

    setFilteredBooksForSearchInRecommendations((prevSelectableBooks) =>
      prevSelectableBooks.map((currentSelectableBook) => ({
        ...currentSelectableBook,
        isSelected: false,
      }))
    );
  };

  // book add button to be passed as a prop to the book previews
  const renderBookButton = (currentSelectableBook: SelectableBook) => (
    <Pressable
      onPress={() => handleAddToLibraryPress(currentSelectableBook.book.id)}
      className="ml-4"
    >
      <AddButtonIcon isAdded={false} />
    </Pressable>
  );

  // delete selected books
  const deleteSelectedBooks = async () => {
    const selectedBookIds = getAllSelectedFilteredBookIds();
    const unselectedSelectableBooks = getUnselectedSelectableBooks();
    const result = await deleteMultipleRecommendedBooksByIds(selectedBookIds);
    if (result) {
      setSelectableBooks(unselectedSelectableBooks);
      setFilteredBooksForSearchInRecommendations(unselectedSelectableBooks);
      setIsDeleteModalVisible(false);
      // update search value
      setSearch("");
      Alert.alert("Successfully deleted selected books");
    } else {
      console.error("Failed to delete recommended books that were selected");
    }
  };

  // handle adding selected books to categories
  const handleAddSelectedBooksToCategories = async (categories: string[]) => {
    const selectedBookObjects = getBookObjectsFromSelectableBooksPassed(
      getSelectedSelectableFilteredBooks()
    );
    // change all selectable book objects to have ratings of 0
    selectedBookObjects.forEach((book) => {
      book.rating = 0;
    })
    let wasAbleToAddBooksToAllCategories = true;

    // for each category add the selected books
    for (const category of categories) {
      const resultOfAddingBooksToCurrentCategory = await addMultipleUserBooksWithCategoryName(
        selectedBookObjects,
        category
      );
      if (!resultOfAddingBooksToCurrentCategory) {
        console.error("Failed to add books to current category: ", category);
        wasAbleToAddBooksToAllCategories = false;
      } else {
      }
    }

    if (wasAbleToAddBooksToAllCategories) {
      const booksSetToAddedToLibrary = selectedBookObjects.map((book) => ({
        ...book,
        addToLibrary: true,
      }));
      const updateBookToAddedToLibraryResult = await updateMultipleRecommendedBooksToBeAddedToLibrary(
        booksSetToAddedToLibrary
      );
      if (!updateBookToAddedToLibraryResult) {
        console.error("Failed to add selected books to all categories");
        return;
      }


      setIsAddingBookModalVisible(false);

      // if add button was pressed reset it to false after adding it
      if (pressedAddBookToLibraryButtonFromBookPreview) {
        setPressedAddBookToLibraryButtonFromBookPreview(false);
      }

      Alert.alert("Successfully added selected books to all categories");
    } else {
      console.error("Failed to add selected books to all categories");
    }
  };

  // will deselect added book that was added by pressing + button in book preview
  const hideAddBooksModal = () => {
    if (pressedAddBookToLibraryButtonFromBookPreview) {
      deselectAllBooks();
      setIsAddingBookModalVisible(false);
      setPressedAddBookToLibraryButtonFromBookPreview(false);
    } else {
      setIsAddingBookModalVisible(false);
    }
  };

  // get book objects array from selectableBooks array
  const getBookObjectsFromSelectableBooksPassed = (
    SelectableBooks: SelectableBook[]
  ) => {
    return SelectableBooks.map(
      (currentSelectableBook) => currentSelectableBook.book
    );
  };

  const RecommendationsPage = () => {
    return (
      <SafeAreaView className="flex-1">
        <View className=" flex-row items-center justify-between">
          {loadingSearchResults ? (
            <LoadingSpinner />
          ) : (
            <>
              <View className="w-[90%] h-16 mx-auto">
                <SearchBar
                  placeholder="Search by title, author, genre, or isbn"
                  onChangeText={updateSearch}
                  value={search}
                />
              </View>
              <Pressable
                className="p-1"
                onPress={() => handleShowSearchResultsModal()}
              >
                <WebIcon height={35} width={35} />
              </Pressable>
            </>
          )}

          {/* handle showing search results modal */}
          <AddSearchResultsBooksModal
            visible={isSearchResultsModalVisible}
            onClose={handleClosingSearchResultsModal}
            onConfirmAddBooks={handleAddSearchResultBooksFromApi}
            categories={categories}
            booksToAdd={searchResults}
          />
        </View>

        <View className="flex-row items-center pt-4 pl-4">
          <Text className="text-white text-xl font-bold text-left">
            Recommendations
          </Text>
          <View className="flex-row  ml-auto">
            <Pressable
              onPress={refreshRecommendedBooksFromApi}
              className="mr-5"
            >
              <RefreshIcon height={35} width={35} />
            </Pressable>
            <Pressable className="mr-1" onPress={selectAllFilteredBooksAndUpdateSelectableBooksToSelectTheFilteredBooks}>
              <SelectIcon height={35} width={35} />
            </Pressable>
          </View>
        </View>

        {/* Book List */}
        {loadingSearchInRecommendations ? (<View className="w-full">
          <LoadingSpinner />
        </View>
        ) : (
          <FlatList
            data={filteredBooksForSearchInRecommendations}
            keyExtractor={(item) => item.book.id}
            renderItem={({ item }) => (
              <BookPreview
                book={item.book}
                button={renderBookButton(item)}
                toggleSelected={toggleSelectedBook}
                selectedBooks={getAllSelectedFilteredBookIds()}
                isRecommendation={true}
              />
            )}
          />
        )}

        {areAnyFilteredBooksSelected() &&
          !pressedAddBookToLibraryButtonFromBookPreview && (
            <View className="flex-row justify-around bg-[#161f2b] w-full border-t border-blue-500">
              <View className="">
                <Pressable
                  className="flex-col items-center"
                  onPress={() => setIsDeleteModalVisible(true)}
                >
                  <DeleteIcon height={size} width={size} />
                  <Text className="text-white text-sm">Delete </Text>
                </Pressable>
              </View>

              <View>
                <Pressable
                  className="flex-col items-center"
                  onPress={() => setIsAddingBookModalVisible(true)}
                >
                  <AddSquareIcon height={size} width={size} />
                  <Text className="text-white text-sm">Add</Text>
                </Pressable>
              </View>

              <View>
                <Pressable
                  className="flex-col items-center"
                  onPress={() => deselectAllBooks()}
                >
                  <CancelIcon height={size} width={size} />
                  <Text className="text-white text-sm">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}

        {/* Delete Books Modal */}
        <DeleteBooksModal
          visible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
          booksToDelete={getBookObjectsFromSelectableBooksPassed(
            getSelectedSelectableFilteredBooks()
          )}
          onConfirm={deleteSelectedBooks}
        />

        {/* Add Books to Category Modal */}
        <AddBooksOrMoveBooksToCategoryModal
          visible={isAddingBookModalVisible}
          onClose={() => hideAddBooksModal()}
          booksToAdd={getBookObjectsFromSelectableBooksPassed(
            getSelectedSelectableFilteredBooks()
          )}
          categories={categories}
          onConfirmAddBooks={handleAddSelectedBooksToCategories}
        />
      </SafeAreaView>
    );
  };

  // will render main component if not loading
  return loadingRecommendations ? <LoadingSpinner /> : RecommendationsPage();
};

export default Recommendations;