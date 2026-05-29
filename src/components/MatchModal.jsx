import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * MatchModal - "It's a Match!" celebration screen.
 *
 * Features:
 * - 60 animated confetti particles (varied sizes, colors, speeds)
 * - Pulsing glow background + gradient border animation
 * - Both users' photos slide in from sides with ring highlights
 * - Animated pulsing heart between photos
 * - Shared skills display as conversation starter
 * - "Send a Message" → navigates to chat | "Keep Swiping" → dismiss
 * - Escape key closes modal
 * - Mobile haptic feedback (vibration API)
 * - Toast notification trigger for background awareness
 *
 * Props:
 * - show: boolean
 * - matchedUser: { _id, firstName, lastName, photoUrl, skills }
 * - currentUser: { firstName, photoUrl, skills }
 * - onClose: callback
 */
const MatchModal = ({ show, matchedUser, currentUser, onClose }) => {
  const [confetti, setConfetti] = useState([]);

  // Generate diverse confetti on show
  useEffect(() => {
    if (show) {
      // Trigger haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      const shapes = ["circle", "square", "triangle"];
      const particles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2.5,
        color: [
          "#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#60a5fa",
          "#fb923c", "#e879f9", "#22d3ee",
        ][Math.floor(Math.random() * 8)],
        size: 5 + Math.random() * 10,
        shape: shapes[Math.floor(Math.random() * 3)],
        drift: (Math.random() - 0.5) * 80,
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [show]);

  // Escape key to close
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    },
    [show, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Find shared skills between both users
  const sharedSkills = useMemo(() => {
    if (!matchedUser?.skills || !currentUser?.skills) return [];
    return currentUser.skills.filter((skill) =>
      matchedUser.skills.includes(skill)
    );
  }, [matchedUser?.skills, currentUser?.skills]);

  if (!matchedUser || !currentUser) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute top-0"
                style={{
                  left: `${particle.x}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "triangle" ? "0" : "2px",
                  clipPath: particle.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
                }}
                initial={{ y: -20, opacity: 1, scale: 1 }}
                animate={{
                  y: "100vh",
                  x: particle.drift,
                  opacity: 0,
                  rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
                  scale: 0.5,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeIn",
                }}
              />
            ))}
          </div>

          {/* Modal Content */}
          <motion.div
            className="relative bg-base-200 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl overflow-hidden"
            initial={{ scale: 0.3, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="It's a Match!"
          >
            {/* Animated gradient border glow */}
            <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-60 blur-sm animate-pulse pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl bg-base-200 pointer-events-none" />

            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(236,72,153,0.1) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Content (relative to sit above glow layers) */}
            <div className="relative z-10">
              {/* Title */}
              <motion.h2
                className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent mb-6"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.3 }}
              >
                It&apos;s a Match!
              </motion.h2>

              {/* Profile Photos */}
              <div className="flex justify-center items-center gap-3 mb-5">
                {/* Current user photo */}
                <motion.div
                  initial={{ x: -60, opacity: 0, scale: 0.5 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-pink-500 ring-offset-2 ring-offset-base-200 shadow-xl shadow-pink-500/20">
                    <img
                      src={currentUser.photoUrl}
                      alt={`${currentUser.firstName}'s photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Pulsing heart */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.6 }}
                  aria-hidden="true"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 sm:h-12 sm:w-12 text-pink-500 drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </motion.svg>
                </motion.div>

                {/* Matched user photo */}
                <motion.div
                  initial={{ x: 60, opacity: 0, scale: 0.5 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-purple-500 ring-offset-2 ring-offset-base-200 shadow-xl shadow-purple-500/20">
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
                className="text-base-content/70 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                You and{" "}
                <span className="font-bold text-base-content">
                  {matchedUser.firstName}
                </span>{" "}
                are interested in each other!
              </motion.p>

              {/* Shared Skills - conversation starter */}
              {sharedSkills.length > 0 && (
                <motion.div
                  className="mb-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <p className="text-xs text-base-content/50 mb-2">
                    You both know:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {sharedSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="badge badge-secondary badge-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {sharedSkills.length > 5 && (
                      <span className="badge badge-ghost badge-sm">
                        +{sharedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link
                  to={`/chat/${matchedUser._id}`}
                  className="btn btn-primary btn-lg w-full shadow-lg shadow-primary/30"
                  onClick={onClose}
                >
                  💬 Send a Message
                </Link>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm w-full opacity-70 hover:opacity-100"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
