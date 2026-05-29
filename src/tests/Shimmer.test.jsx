import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  CardSkeleton,
  ListSkeleton,
  Spinner,
  ErrorState,
  EmptyState,
} from "../components/Shimmer";

describe("Shimmer Components", () => {
  describe("CardSkeleton", () => {
    it("renders with animate-pulse class", () => {
      const { container } = render(<CardSkeleton />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("ListSkeleton", () => {
    it("renders specified count of skeletons", () => {
      const { container } = render(<ListSkeleton count={3} />);
      const items = container.querySelectorAll(".animate-pulse");
      expect(items.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Spinner", () => {
    it("renders with default text", () => {
      render(<Spinner />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders with custom text", () => {
      render(<Spinner text="Fetching data..." />);
      expect(screen.getByText("Fetching data...")).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("renders error message", () => {
      render(<ErrorState message="Something went wrong" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders retry button when onRetry provided", () => {
      const onRetry = vi.fn();
      render(<ErrorState message="Error" onRetry={onRetry} />);
      const btn = screen.getByText("Try Again");
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("does not render retry button when no onRetry", () => {
      render(<ErrorState message="Error" />);
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("renders title and description", () => {
      render(<EmptyState title="No data" description="Nothing here yet" />);
      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    });

    it("renders action button when provided", () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Go Home", onClick }}
        />
      );
      const btn = screen.getByText("Go Home");
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders custom icon", () => {
      render(<EmptyState icon="🚀" title="Test" />);
      expect(screen.getByText("🚀")).toBeInTheDocument();
    });
  });
});
