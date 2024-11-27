import React from "react";
import { render } from "@testing-library/react-native";
import Categories from "@/app/library";

describe("Categories component tests", () => {
  test("should render a search bar with the correct placeholder text", () => {
    const { getByPlaceholderText } = render(<Categories />);

    // Check if the search bar with the placeholder text is rendered
    const searchBar = getByPlaceholderText("Search by category name...");
    expect(searchBar).toBeTruthy(); // Ensure the search bar exists
  });
});
