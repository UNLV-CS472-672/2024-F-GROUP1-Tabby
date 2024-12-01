import React from "react";
import { render, screen } from "@testing-library/react-native";
import WelcomeScreen from "@/app/index"; // Adjust the import based on your file structure

// Mocking the Link component
jest.mock("expo-router", () => ({
  Link: ({ children, href }) => (
    // eslint-disable-next-line react/no-unknown-property
    <a href={href} testID="get-started-button">
      {children}
    </a>
  ),
}));

describe("WelcomeScreen", () => {
  it("renders welcome message", () => {
    render(<WelcomeScreen />);
    expect(screen.getByText("Welcome to Tabby")).toBeTruthy();
  });

  it("renders description text", () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByText(
        "Scan books and store your book information effortlessly."
      )
    ).toBeTruthy();
  });

  it("renders the Get Started button", () => {
    render(<WelcomeScreen />);
    const getStartedButton = screen.getByTestId("get-started-button");
    expect(getStartedButton).toBeTruthy();
  });

  it("navigates to /library when the Get Started button is pressed", () => {
    render(<WelcomeScreen />);
    const getStartedButton = screen.getByTestId("get-started-button");
    expect(getStartedButton.props.href).toBe("/library");
  });
});
