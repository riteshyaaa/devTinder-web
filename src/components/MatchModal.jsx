import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * MatchModal - "It's a Match!" celebration screen.
 * Shows when both users expressed mutual interest.
 *
 * Props:
 * - show: boolean to control visibility
 * - matchedUser: { _id, firstName, lastName, photoUrl }
 * - currentUser: { firstName, photoUrl }
 * - onClose: callback to dismiss the modal
 */
const MatchModal = ({ show, matchedUser, currentUser, onClose }) => {
  const [confetti, setConfetti] = useState([]);

  // Generate confetti particles on show
  useEffect(() => {
    if (show) {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ["#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#60a5fa"][
          Math.floor(Math.random() * 5)
        ],
        size: 6 + Math.random() * 8,
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [show]);

  if (!matchedUser || !currentUser) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="It's a Match!"
        >
          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute top-0 rounded-full pointer-events-none"
              style={{
                left: `${particle.x}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: "100vh",
                opacity: 0,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeIn",
              }}
              aria-hidden="true"
            />
          ))}

          {/* Modal Content */}
          <motion.div
            className="bg-base-200 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse pointer-events-none" />

            {/* Title */}
            <motion.h2
              className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
            >
              It&apos;s a Match!
            </motion.h2>

            {/* Profile Photos */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <motion.div
                className="relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-500 ring-offset-2 ring-offset-base-200">
                  <img
                    src={currentUser.photoUrl}
                    alt={`${currentUser.firstName}'s photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Heart icon between photos */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.6 }}
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500 ring-offset-2 ring-offset-base-200">
                  <img
                    src={matchedUser.photoUrl}
                    alt={`${matchedUser.firstName}'s photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Message */}
            <motion.p
              className="text-base-content/70 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              You and <span className="font-semibold">{matchedUser.firstName}</span>{" "}
              are interested in each other!
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                to={`/chat/${matchedUser._id}`}
                className="btn btn-primary w-full"
                onClick={onClose}
              >
                Send a Message
              </Link>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm w-full"
              >
                Keep Swiping
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
