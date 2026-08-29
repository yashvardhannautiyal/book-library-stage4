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


test("does not show results from an older search", async () => {
  const user = userEvent.setup();

  let firstResolve;
  let secondResolve;

  global.fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          firstResolve = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          secondResolve = resolve;
        }),
    );

  render(
    <BookDiscover
      shelves={[{ id: "to-read", name: "To Read" }]}
      onAddBook={vi.fn()}
    />,
  );

  const input = screen.getByPlaceholderText("Search for a book or author");

  // First search
  await user.type(input, "Harry");

  // Wait for the debounce
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Change search before the first request finishes
  await user.clear(input);
  await user.type(input, "Potter");

  // Wait for the second debounced request
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Newer search finishes first
  secondResolve({
    ok: true,
    json: () =>
      Promise.resolve({
        docs: [
          {
            key: "/works/NEW",
            title: "New Search Book",
            author_name: ["New Author"],
          },
        ],
        numFound: 1,
      }),
  });

  await waitFor(() => {
    expect(screen.getByText("New Search Book")).toBeInTheDocument();
  });

  // Older request finishes afterwards
  firstResolve({
    ok: true,
    json: () =>
      Promise.resolve({
        docs: [
          {
            key: "/works/OLD",
            title: "Old Search Book",
            author_name: ["Old Author"],
          },
        ],
        numFound: 1,
      }),
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Old result must never replace the new result
  expect(screen.queryByText("Old Search Book")).not.toBeInTheDocument();
  expect(screen.getByText("New Search Book")).toBeInTheDocument();
});