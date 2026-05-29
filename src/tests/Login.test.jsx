import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../components/Login";
import userReducer from "../utils/userSlice";
import feedReducer from "../utils/feedSlice";
import connectionReducer from "../utils/connectionSlice";
import requestReducer from "../utils/requestSlice";
import notificationReducer from "../utils/notificationSlice";

// Mock the API module
vi.mock("../services/api", () => ({
  loginUser: vi.fn(),
  signUpUser: vi.fn(),
  logoutUser: vi.fn(),
  fetchProfile: vi.fn(),
  getErrorMessage: (err) => err?.response?.data?.error || err?.message || "Error",
  default: { interceptors: { response: { use: vi.fn() } } },
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      feed: feedReducer,
      connections: connectionReducer,
      requests: requestReducer,
      notifications: notificationReducer,
    },
  });

const renderLogin = () => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6/i)).toBeInTheDocument();
  });

  it("switches to signup form when clicking toggle", async () => {
    renderLogin();
    const toggle = screen.getByText(/new here/i);
    await userEvent.click(toggle);

    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    renderLogin();
    const submitBtn = screen.getByRole("button", { name: /log in/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email format", async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "not-an-email");

    const submitBtn = screen.getByRole("button", { name: /log in/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/at least 6/i);

    await userEvent.type(emailInput, "test@test.com");
    await userEvent.type(passwordInput, "123");

    const submitBtn = screen.getByRole("button", { name: /log in/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/at least 6/i)).toBeInTheDocument();
  });

  it("shows forgot password link in login mode", () => {
    renderLogin();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("hides forgot password link in signup mode", async () => {
    renderLogin();
    const toggle = screen.getByText(/new here/i);
    await userEvent.click(toggle);

    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
  });

  it("shows confirm password validation in signup", async () => {
    renderLogin();
    const toggle = screen.getByText(/new here/i);
    await userEvent.click(toggle);

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/^email$/i), "john@test.com");

    const passwordInputs = screen.getAllByPlaceholderText(/at least 6/i);
    await userEvent.type(passwordInputs[0], "Test@123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Different@1");

    const submitBtn = screen.getByRole("button", { name: /sign up/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
  });
});
