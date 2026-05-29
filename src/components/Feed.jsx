import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import SwipeableCard from "./SwipeableCard";
import MatchModal from "./MatchModal";
import useFeed from "../hooks/useFeed";
import { CardSkeleton, ErrorState, EmptyState } from "./Shimmer";

const Feed = () => {
  const { feed, loading, error, getFeed, handleSwipe, retry } = useFeed();
  const currentUser = useSelector((state) => state.user);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    getFeed();
  }, []);

  const onSwipe = async (status, userId) => {
    // Find the user being swiped before removing from feed
    const swipedUser = feed?.find((u) => u._id === userId);
    const result = await handleSwipe(status, userId);

    // If it's a match, show the celebration modal
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
      <div className="flex justify-center my-10">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (!feed || feed.length <= 0) {
    return (
      <EmptyState
        icon="👀"
        title="No more developers to show"
        description="You've seen everyone! Come back later for new profiles."
      />
    );
  }

  return (
    <>
      <div className="flex justify-center my-10 min-h-[500px]">
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
      </div>

      {/* Match Celebration Modal */}
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
