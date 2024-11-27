import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Favorites from "@/app/favorites";
import Categories from "@/app/library";
import CategoryPage from "@/app/library/[category]";
import Recommendations from "@/app/recommendations";

jest.mock("expo-router", () => {
  const { Pressable } = require("react-native");
  return {
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ category: "default-category" }),
  };
});

// mocks to make expo sdk 52 stop throwing errors
jest.mock("expo-font", () => {
  return {
    isLoaded: jest.fn(),
    forEach: jest.fn(),
    loadAsync: jest.fn(),
  };
});

// tests relating to the search bar
describe("Favorite tab tests", () => {
  // make sure that the search bar takes input correctly on each page that it's on
  test("Correct search bar input", () => {
    // render favorites page
    const favoritesPage = render(<Favorites />);
    // get search bar
    const searchBar = favoritesPage.getByPlaceholderText(
      "Search by title, ISBN, or author..."
    );
    // change text in search bar
    fireEvent.changeText(searchBar, "tempText");
    // make sure search bar has proper value
    expect(searchBar.props.value).toBe("tempText");

    // render categories page
    const categoriesPage = render(<Categories />);
    // get search bar
    const searchBar2 = categoriesPage.getByPlaceholderText(
      "Search for a category..."
    );
    // change text in search bar
    fireEvent.changeText(searchBar2, "tempText2");
    // make sure search bar has proper value
    expect(searchBar2.props.value).toBe("tempText2");

    // // render categories page
    // const categorypagePage = render(<CategoryPage />);
    // // get search bar
    // const searchBar3 = categorypagePage.getByPlaceholderText('Search by title, ISBN, or author...');
    // // change text in search bar
    // fireEvent.changeText(searchBar3, 'tempText3');
    // // make sure search bar has proper value
    // expect(searchBar3.props.value).toBe('tempText3');

    // // render categories page
    // const recommendationsPage = render(<Recommendations />);
    // // get search bar
    // const searchBar4 = recommendationsPage.getByPlaceholderText('Search by title, ISBN, or author...');
    // // change text in search bar
    // fireEvent.changeText(searchBar4, 'tempText4');
    // // make sure search bar has proper value
    // expect(searchBar4.props.value).toBe('tempText4');
  });
});
