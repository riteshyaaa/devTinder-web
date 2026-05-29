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
    undoHistory,
    undoLoading,
    superLikesRemaining,
    boostActive,
    boostEndTime,
    getFeed,
    handleSwipe,
    handleSuperLike,
    handleBoost,
    handleUndo,
    updateFilters,
    resetFilters,
    retry,
  } = useFeed();
  const currentUser = useSelector((state) => state.user);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [superLikeError, setSuperLikeError] = useState("");

  useEffect(() => {
    getFeed();
  }, []);

  // Clear super like error after 3s
  useEffect(() => {
    if (superLikeError) {
      const t = setTimeout(() => setSuperLikeError(""), 3000);
      return () => clearTimeout(t);
    }
  }, [superLikeError]);

  const onSwipe = async (status, userId) => {
    const swipedUser = feed?.find((u) => u._id === userId);
    const result = await handleSwipe(status, userId);

    if (result.success && result.isMatch && swipedUser) {
      setMatchedUser(swipedUser);
      setShowMatch(true);
    }
  };

  const onSuperLike = async (userId) => {
    const swipedUser = feed?.find((u) => u._id === userId);
    const result = await handleSuperLike(userId);

    if (result.success && result.isMatch && swipedUser) {
      setMatchedUser(swipedUser);
      setShowMatch(true);
    } else if (!result.success) {
      setSuperLikeError(result.error);
    }
  };

  const onBoost = async () => {
    setBoostLoading(true);
    await handleBoost();
    setBoostLoading(false);
  };

  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  // Format boost remaining time
  const getBoostTimeRemaining = () => {
    if (!boostEndTime) return "";
    const remaining = Math.max(0, boostEndTime - Date.now());
    const mins = Math.floor(remaining / 60000);
    return `${mins}m`;
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
          {/* Boost & Super Like status bar */}
          <div className="flex items-center gap-3 mb-3">
            {/* Boost button */}
            <button
              onClick={onBoost}
              disabled={boostActive || boostLoading}
              className={`btn btn-sm gap-1.5 ${boostActive ? "btn-accent" : "btn-outline btn-accent"}`}
              aria-label={boostActive ? `Boost active (${getBoostTimeRemaining()} remaining)` : "Boost your profile"}
              title="Boost your profile for 30 minutes — get more visibility"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {boostLoading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : boostActive ? (
                `Boosted (${getBoostTimeRemaining()})`
              ) : (
                "Boost"
              )}
            </button>

            {/* Super Like counter */}
            <span className="text-xs opacity-60 flex items-center gap-1">
              <span className="text-blue-400">⭐</span>
              {superLikesRemaining} Super Like{superLikesRemaining !== 1 ? "s" : ""} left today
            </span>
          </div>

          {/* Super Like error toast */}
          <AnimatePresence>
            {superLikeError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="alert alert-warning py-2 px-4 text-sm mb-3 max-w-sm"
              >
                {superLikeError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swipeable Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={feed[0]._id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SwipeableCard
                user={feed[0]}
                onSwipe={onSwipe}
                onSuperLike={onSuperLike}
                superLikesRemaining={superLikesRemaining}
              />
            </motion.div>
          </AnimatePresence>

          {/* Undo Button (supports last 3) */}
          <AnimatePresence>
            {undoHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-2"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  )}
                  Undo ({undoHistory[0]?.user.firstName})
                </button>
                {undoHistory.length > 1 && (
                  <span className="badge badge-ghost badge-sm">
                    +{undoHistory.length - 1} more
                  </span>
                )}
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
