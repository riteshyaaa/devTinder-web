/**
 * Avatar — Displays user photo with initials fallback when no image is available.
 *
 * Features:
 * - Shows photo when photoUrl is provided and valid
 * - Falls back to colored initials circle when photo is missing or fails to load
 * - Deterministic background color based on user's name (consistent across renders)
 * - Online indicator dot (optional)
 * - Multiple sizes: xs, sm, md, lg, xl
 *
 * Props:
 * - firstName: string
 * - lastName: string (optional)
 * - photoUrl: string (optional)
 * - size: "xs" | "sm" | "md" | "lg" | "xl" (default: "md")
 * - isOnline: boolean (optional) — shows green dot
 * - className: string (optional) — additional classes
 */
import { useState } from "react";

const COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
  "bg-cyan-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
];

const SIZE_CLASSES = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-xl",
  xl: "w-28 h-28 text-2xl",
};

const ONLINE_DOT_SIZES = {
  xs: "w-2 h-2 border",
  sm: "w-2.5 h-2.5 border-[1.5px]",
  md: "w-3.5 h-3.5 border-2",
  lg: "w-4 h-4 border-2",
  xl: "w-5 h-5 border-2",
};

const Avatar = ({
  firstName = "",
  lastName = "",
  photoUrl,
  size = "md",
  isOnline,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate initials (max 2 characters)
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  // Deterministic color based on name
  const colorIndex =
    (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  const bgColor = COLORS[colorIndex % COLORS.length];

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const dotSize = ONLINE_DOT_SIZES[size] || ONLINE_DOT_SIZES.md;

  const showImage = photoUrl && !imgError;

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}'s profile photo`}
          className={`${sizeClass} rounded-full object-cover`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-bold select-none`}
          aria-label={`${firstName} ${lastName}'s avatar`}
        >
          {initials}
        </div>
      )}

      {/* Online indicator dot */}
      {typeof isOnline === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-base-200 ${
            isOnline ? "bg-success" : "bg-base-content/30"
          }`}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};

export default Avatar;
