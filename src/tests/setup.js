import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => {
  const createMockComponent = (tag) => {
    return ({ children, ...props }) => {
      // Filter out framer-motion specific props
      const validProps = {};
      for (const [key, value] of Object.entries(props)) {
        if (!["initial", "animate", "exit", "transition", "whileHover",
              "whileTap", "variants", "style", "drag", "dragConstraints",
              "dragElastic", "onDragEnd"].includes(key) &&
            typeof value !== "object") {
          validProps[key] = value;
        }
      }
      return null; // Return null — tests check text content not wrapper elements
    };
  };

  return {
    motion: new Proxy({}, {
      get: () => ({ children, ...props }) => children || null,
    }),
    AnimatePresence: ({ children }) => children || null,
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useTransform: () => ({ get: () => 0 }),
    animate: () => Promise.resolve(),
  };
});

// Mock socket.io
vi.mock("../utils/socket", () => ({
  getSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: true,
  }),
  disconnectSocket: vi.fn(),
  default: () => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock navigator.vibrate
global.navigator.vibrate = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
