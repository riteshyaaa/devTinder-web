import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * SwipeableCard wraps a UserCard-like UI with drag-to-swipe functionality.
 * Drag right → "Interested" | Drag left → "Ignored"
 */
const SwipeableCard = ({ user, onSwipe }) => {
  const { firstName, lastName, age, about, gender, photoUrl, _id } = user;
  const [exiting, setExiting] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.5, 1, 1, 1, 0.5]);

  // Overlay indicators
  const interestedOpacity = useTransform(x, [0, 100, 200], [0, 0.6, 1]);
  const ignoreOpacity = useTransform(x, [-200, -100, 0], [1, 0.6, 0]);

  const handleDragEnd = async (_, info) => {
    const threshold = 120;

    if (info.offset.x > threshold) {
      // Swiped right → Interested
      setExiting(true);
      await animate(x, 500, { duration: 0.3 });
      if (onSwipe) await onSwipe("interested", _id);
    } else if (info.offset.x < -threshold) {
      // Swiped left → Ignored
      setExiting(true);
      await animate(x, -500, { duration: 0.3 });
      if (onSwipe) await onSwipe("ignored", _id);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  const handleButtonSwipe = async (status) => {
    setExiting(true);
    const targetX = status === "interested" ? 500 : -500;
    await animate(x, targetX, { duration: 0.3 });
    if (onSwipe) await onSwipe(status, _id);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Card Stack Visual (background cards) */}
      <div className="absolute top-2 w-80 h-[420px] bg-base-300 rounded-xl opacity-20 scale-[0.95]" />
      <div className="absolute top-1 w-84 h-[420px] bg-base-300 rounded-xl opacity-40 scale-[0.97]" />

      {/* Swipeable Card */}
      <motion.div
        className="card bg-base-300 w-96 shadow-xl cursor-grab active:cursor-grabbing relative select-none"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.02 }}
        aria-label={`Profile card for ${firstName} ${lastName}. Drag right to show interest, drag left to ignore.`}
        role="article"
      >
        {/* Swipe direction indicators */}
        <motion.div
          className="absolute top-6 right-6 z-10 bg-success text-success-content px-4 py-2 rounded-lg font-bold text-xl border-2 border-success rotate-12"
          style={{ opacity: interestedOpacity }}
          aria-hidden="true"
        >
          INTERESTED
        </motion.div>
        <motion.div
          className="absolute top-6 left-6 z-10 bg-error text-error-content px-4 py-2 rounded-lg font-bold text-xl border-2 border-error -rotate-12"
          style={{ opacity: ignoreOpacity }}
          aria-hidden="true"
        >
          IGNORE
        </motion.div>

        <figure className="overflow-hidden rounded-t-xl">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}'s profile photo`}
            className="w-full h-64 object-cover pointer-events-none"
            draggable="false"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            {firstName} {lastName}
          </h2>
          {age && gender && (
            <p className="opacity-70 text-sm">{age}, {gender}</p>
          )}
          {about && <p className="text-sm line-clamp-3">{about}</p>}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={() => handleButtonSwipe("ignored")}
          disabled={exiting}
          className="btn btn-circle btn-lg btn-error shadow-lg hover:scale-110 transition-transform"
          aria-label={`Ignore ${firstName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          onClick={() => handleButtonSwipe("interested")}
          disabled={exiting}
          className="btn btn-circle btn-lg btn-success shadow-lg hover:scale-110 transition-transform"
          aria-label={`Show interest in ${firstName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-base-content/40 mt-3">
        Drag the card or use the buttons
      </p>
    </div>
  );
};

export default SwipeableCard;
