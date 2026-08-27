import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, test, expect, beforeEach, afterEach } from "vitest";
import BookDiscover from "./BookDiscover";
import "@testing-library/jest-dom/vitest";

const mockBooks = [
  {
    key: "/works/OL1W",
    title: "Book One",
    author_name: ["Author One"],
    cover_i: 123,
  },
  {
    key: "/works/OL2W",
    title: "Book Two",
    author_name: ["Author Two"],
  },
];

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: mockBooks,
          numFound: 10,
        }),
    }),
  );
});

afterEach(() => {
  cleanup();
});

// TEST : search result
test("displays search results", async () => {
  const user = userEvent.setup();

  render(
    <BookDiscover
      shelves={[{ id: "to-read", name: "To Read" }]}
      onAddBook={vi.fn()}
    />,
  );

  const input = screen.getByPlaceholderText("Search for a book or author");

  await user.type(input, "Harry");

  await waitFor(() => {
    expect(screen.getByText("Book One")).toBeInTheDocument();
  });
});

// TEST : pagination
test("pagination starts on page 1 with Previous disabled", async () => {
  const user = userEvent.setup();

  render(
    <BookDiscover
      shelves={[{ id: "to-read", name: "To Read" }]}
      onAddBook={vi.fn()}
    />,
  );

  const input = screen.getByPlaceholderText("Search for a book or author");

  await user.type(input, "Harry");

  await waitFor(() => {
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  const previousButton = screen.getByRole("button", {
    name: "Previous",
  });

  expect(previousButton).toBeDisabled();
});
