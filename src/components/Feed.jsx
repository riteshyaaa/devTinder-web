import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import SwipeableCard from "./SwipeableCard";
import MatchModal from "./MatchModal";
import FeedFilter from "./FeedFilter";
import useFeed from "../hooks/useFeed";
import { CardSkeleton, ErrorState, EmptyState } from "./Shimmer";

const Feed = () => {
  const {
    feed,
    loading,
    error,
    filters,
    lastSwiped,
    undoLoading,
    getFeed,
    handleSwipe,
    handleUndo,
    updateFilters,
    resetFilters,
    retry,
  } = useFeed();
  const currentUser = useSelector((state) => state.user);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    getFeed();
  }, []);

  const onSwipe = async (status, userId) => {
    const swipedUser = feed?.find((u) => u._id === userId);
    const result = await handleSwipe(status, userId);

    if (result.success && result.isMatch && swipedUser) {
      setMatchedUser(swipedUser);
      setShowMatch(true);
    }
  };

  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  if (loading && !feed) {
    return (
      <div className="flex flex-col items-center my-10">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  return (
    <>
      {/* Filter Panel */}
      <div className="flex justify-center mt-4">
        <FeedFilter
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
        />
      </div>

      {/* Feed Content */}
      {!feed || feed.length <= 0 ? (
        <EmptyState
          icon="👀"
          title="No more developers to show"
          description="Try adjusting your filters or come back later for new profiles."
          action={
            filters.skills?.length > 0 || filters.experienceLevel || filters.location
              ? { label: "Clear Filters", onClick: resetFilters }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col items-center my-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={feed[0]._id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SwipeableCard user={feed[0]} onSwipe={onSwipe} />
            </motion.div>
          </AnimatePresence>

          {/* Undo Button */}
          <AnimatePresence>
            {lastSwiped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <button
                  onClick={handleUndo}
                  disabled={undoLoading}
                  className="btn btn-warning btn-sm gap-2"
                  aria-label="Undo last swipe"
                >
                  {undoLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                  )}
                  Undo ({lastSwiped.user.firstName})
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Match Modal */}
      <MatchModal
        show={showMatch}
        matchedUser={matchedUser}
        currentUser={currentUser}
        onClose={handleCloseMatch}
      />
    </>
  );
};

export default Feed;
