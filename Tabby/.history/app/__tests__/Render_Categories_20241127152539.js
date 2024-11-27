import React from "react";
import { render } from "@testing-library/react-native";
import Categories from "@/app/library";

test("Renders Categories component", () => {
  const { getByText } = render(<Categories />);
  expect(getByText("Expected Text in Categories")).toBeTruthy();
});
