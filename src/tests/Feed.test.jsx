import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Feed from "../components/Feed";
import userReducer from "../utils/userSlice";
import feedReducer from "../utils/feedSlice";
import connectionReducer from "../utils/connectionSlice";
import requestReducer from "../utils/requestSlice";
import notificationReducer from "../utils/notificationSlice";

// Mock API
vi.mock("../services/api", () => ({
  fetchFeed: vi.fn().mockResolvedValue({
    data: [
      {
        _id: "user1",
        firstName: "Alice",
        lastName: "Dev",
        age: 25,
        gender: "female",
        photoUrl: "https://example.com/photo.jpg",
        about: "Full-stack developer",
        skills: ["React", "Node.js"],
      },
      {
        _id: "user2",
        firstName: "Bob",
        lastName: "Coder",
        age: 30,
        gender: "male",
        photoUrl: "https://example.com/photo2.jpg",
        about: "Backend engineer",
        skills: ["Python", "AWS"],
      },
    ],
  }),
  sendConnectionRequest: vi.fn().mockResolvedValue({ data: { isMatch: false } }),
  sendSuperLike: vi.fn().mockResolvedValue({ data: { isMatch: false } }),
  boostProfile: vi.fn().mockResolvedValue({ data: {} }),
  undoLastSwipe: vi.fn().mockResolvedValue({ data: {} }),
  getErrorMessage: (err) => err?.message || "Error",
  default: { interceptors: { response: { use: vi.fn() } } },
}));

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      user: userReducer,
      feed: feedReducer,
      connections: connectionReducer,
      requests: requestReducer,
      notifications: notificationReducer,
    },
    preloadedState: {
      user: { _id: "me", firstName: "Test", lastName: "User", photoUrl: "", skills: ["React"] },
      ...preloadedState,
    },
  });

const renderFeed = (preloadedState) => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    </Provider>
  );
};

describe("Feed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading skeleton initially", () => {
    renderFeed({ feed: null });
    // The CardSkeleton renders animated divs
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows empty state when feed is empty", () => {
    renderFeed({ feed: [] });
    expect(screen.getByText(/no more developers/i)).toBeInTheDocument();
  });

  it("renders swipeable card when feed has users", async () => {
    const { fetchFeed } = await import("../services/api");
    renderFeed({
      feed: [
        {
          _id: "user1",
          firstName: "Alice",
          lastName: "Dev",
          age: 25,
          photoUrl: "https://example.com/photo.jpg",
          about: "Full-stack developer",
          skills: ["React"],
        },
      ],
    });

    expect(screen.getByText("Alice Dev")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("shows boost button", () => {
    renderFeed({
      feed: [{ _id: "u1", firstName: "X", lastName: "Y", photoUrl: "", skills: [] }],
    });
    expect(screen.getByText(/boost/i)).toBeInTheDocument();
  });

  it("shows super likes remaining counter", () => {
    renderFeed({
      feed: [{ _id: "u1", firstName: "X", lastName: "Y", photoUrl: "", skills: [] }],
    });
    expect(screen.getByText(/super like/i)).toBeInTheDocument();
  });

  it("shows filter button", () => {
    renderFeed({
      feed: [{ _id: "u1", firstName: "X", lastName: "Y", photoUrl: "", skills: [] }],
    });
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
  });
});
