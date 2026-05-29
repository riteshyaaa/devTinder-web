import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * SwipeableCard — Tinder-style drag-to-swipe developer card.
 *
 * Features:
 * - Drag right → "Interested" | Drag left → "Ignored"
 * - Card rotation & opacity on drag
 * - Animated direction labels (INTERESTED / IGNORE)
 * - Card stack visual (2 cards behind)
 * - Skill badges displayed
 * - Mobile touch + Desktop mouse support via framer-motion
 * - Button fallback for accessibility
 */
const SwipeableCard = ({ user, onSwipe, onSuperLike, superLikesRemaining }) => {
  const {
    firstName,
    lastName,
    age,
    about,
    gender,
    photoUrl,
    skills,
    experienceLevel,
    location,
    github,
    currentlyBuilding,
    availability,
    socialLinks,
    _id,
  } = user;
  const [exiting, setExiting] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.4, 1, 1, 1, 0.4]);

  // Overlay label opacities
  const interestedOpacity = useTransform(x, [0, 80, 180], [0, 0.5, 1]);
  const ignoreOpacity = useTransform(x, [-180, -80, 0], [1, 0.5, 0]);

  // Background color tint during swipe
  const bgColor = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      "rgba(239,68,68,0.08)",
      "rgba(239,68,68,0.04)",
      "rgba(0,0,0,0)",
      "rgba(34,197,94,0.04)",
      "rgba(34,197,94,0.08)",
    ]
  );

  // Keyboard navigation: arrow keys to swipe
  const handleKeyDown = useCallback(
    (e) => {
      if (exiting) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleButtonSwipe("interested");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleButtonSwipe("ignored");
      }
    },
    [exiting]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDragEnd = async (_, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    // Use velocity-based detection for quick flicks
    if (info.offset.x > threshold || velocity > 500) {
      setExiting(true);
      await animate(x, 600, { duration: 0.25, ease: "easeOut" });
      if (onSwipe) await onSwipe("interested", _id);
    } else if (info.offset.x < -threshold || velocity < -500) {
      setExiting(true);
      await animate(x, -600, { duration: 0.25, ease: "easeOut" });
      if (onSwipe) await onSwipe("ignored", _id);
    } else {
      animate(x, 0, { type: "spring", stiffness: 600, damping: 30 });
    }
  };

  const handleButtonSwipe = async (status) => {
    if (exiting) return;
    setExiting(true);
    const targetX = status === "interested" ? 600 : -600;
    await animate(x, targetX, { duration: 0.3, ease: "easeOut" });
    if (onSwipe) await onSwipe(status, _id);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center select-none rounded-3xl p-2"
      style={{ backgroundColor: bgColor }}
      transition={{ duration: 0.1 }}
    >
      {/* Card Stack Visual (background cards for depth) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[340px] h-[440px] bg-base-300 rounded-2xl opacity-15 scale-[0.92]" />
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[360px] h-[440px] bg-base-300 rounded-2xl opacity-30 scale-[0.96]" />

      {/* Main Swipeable Card */}
      <motion.div
        className="card bg-base-300 w-[360px] sm:w-96 shadow-2xl cursor-grab active:cursor-grabbing relative z-10 rounded-2xl overflow-hidden"
        style={{ x, rotate, opacity }}
        drag={exiting ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.02 }}
        aria-label={`Profile card for ${firstName} ${lastName}. Drag right to show interest, drag left to ignore.`}
        role="article"
      >
        {/* Swipe direction overlay labels */}
        <motion.div
          className="absolute top-8 right-4 z-20 bg-success/90 text-success-content px-4 py-2 rounded-lg font-bold text-lg border-2 border-success rotate-12 shadow-lg"
          style={{ opacity: interestedOpacity }}
          aria-hidden="true"
        >
          INTERESTED
        </motion.div>
        <motion.div
          className="absolute top-8 left-4 z-20 bg-error/90 text-error-content px-4 py-2 rounded-lg font-bold text-lg border-2 border-error -rotate-12 shadow-lg"
          style={{ opacity: ignoreOpacity }}
          aria-hidden="true"
        >
          IGNORE
        </motion.div>

        {/* Profile Image */}
        <figure className="relative">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}'s profile photo`}
            className="w-full h-72 object-cover pointer-events-none"
            draggable="false"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-base-300 to-transparent" />
        </figure>

        {/* Card Content */}
        <div className="card-body pt-2 pb-4 px-5">
          {/* Name & Experience */}
          <div className="flex items-baseline gap-2">
            <h2 className="card-title text-xl">
              {firstName} {lastName}
            </h2>
            {age && <span className="text-sm opacity-60">{age}</span>}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-60">
            {gender && <span>{gender}</span>}
            {experienceLevel && (
              <span className="badge badge-ghost badge-xs">{experienceLevel}</span>
            )}
            {location && (
              <span className="flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
          </div>

          {/* About */}
          {about && <p className="text-sm mt-1 line-clamp-2 opacity-80">{about}</p>}

          {/* Currently Building */}
          {currentlyBuilding && (
            <p className="text-xs mt-1 flex items-center gap-1 text-secondary">
              <span aria-hidden="true">🔨</span>
              <span className="italic line-clamp-1">{currentlyBuilding}</span>
            </p>
          )}

          {/* Availability badge */}
          {availability && availability !== "not-available" && (
            <span className={`badge badge-xs mt-1 ${
              availability === "open" ? "badge-success" :
              availability === "busy" ? "badge-warning" : "badge-info"
            }`}>
              {availability === "open" ? "Open to chat" :
               availability === "busy" ? "Busy" :
               availability === "weekends" ? "Weekends only" :
               availability === "evenings" ? "Evenings only" : availability}
            </span>
          )}

          {/* Social links (icons) */}
          {socialLinks && (socialLinks.linkedin || socialLinks.twitter || socialLinks.website) && (
            <div className="flex gap-2 mt-1">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Website">
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
                </a>
              )}
            </div>
          )}

          {/* Skill Badges */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="badge badge-primary badge-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 8 && (
                <span className="badge badge-ghost badge-sm">
                  +{skills.length - 8}
                </span>
              )}
            </div>
          )}

          {/* GitHub Stats (compact) */}
          {github && github.username && (
            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current flex-shrink-0" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <a
                href={github.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                @{github.username}
              </a>
              <span className="opacity-50">•</span>
              <span>⭐ {github.totalStars || 0}</span>
              <span className="opacity-50">•</span>
              <span>{github.publicRepos || 0} repos</span>
              {github.followers > 0 && (
                <>
                  <span className="opacity-50">•</span>
                  <span>{github.followers} followers</span>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-6 z-10">
        {/* Ignore */}
        <button
          onClick={() => handleButtonSwipe("ignored")}
          disabled={exiting}
          className="btn btn-circle btn-lg btn-outline btn-error shadow-lg hover:scale-110 hover:btn-error transition-all duration-200"
          aria-label={`Ignore ${firstName}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Super Like */}
        <button
          onClick={() => { if (onSuperLike && !exiting) { setExiting(true); onSuperLike(_id); } }}
          disabled={exiting || superLikesRemaining <= 0}
          className={`btn btn-circle btn-md shadow-lg hover:scale-110 transition-all duration-200 ${
            superLikesRemaining > 0
              ? "btn-outline border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
              : "btn-disabled opacity-40"
          }`}
          aria-label={`Super Like ${firstName} (${superLikesRemaining} remaining)`}
          title={superLikesRemaining > 0 ? "Super Like — they'll know you're extra interested!" : "No Super Likes remaining today"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>

        {/* Interested */}
        <button
          onClick={() => handleButtonSwipe("interested")}
          disabled={exiting}
          className="btn btn-circle btn-lg btn-outline btn-success shadow-lg hover:scale-110 hover:btn-success transition-all duration-200"
          aria-label={`Show interest in ${firstName}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-base-content/30 mt-3 z-10">
        Swipe, use buttons, or ← → arrow keys
      </p>
    </motion.div>
  );
};

export default SwipeableCard;
