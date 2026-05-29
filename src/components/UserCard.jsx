import { useState } from "react";

/**
 * UserCard - displays a developer profile card.
 * Shows skill badges when available.
 */
const UserCard = ({ user, onSwipe }) => {
  const { firstName, lastName, age, about, gender, photoUrl, skills, _id } = user;
  const [actionLoading, setActionLoading] = useState("");

  const handleSendRequest = async (status) => {
    if (!onSwipe) return;
    setActionLoading(status);
    await onSwipe(status, _id);
    setActionLoading("");
  };

  return (
    <div className="card bg-base-300 w-96 shadow-xl">
      <figure>
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}'s profile photo`}
          className="w-full h-64 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{firstName} {lastName}</h2>
        {age && gender && <p className="opacity-70 text-sm">{age}, {gender}</p>}
        {about && <p className="text-sm line-clamp-2">{about}</p>}

        {/* Skill Badges */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="badge badge-primary badge-sm"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="badge badge-ghost badge-sm">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* Action buttons (only when onSwipe is provided) */}
        {onSwipe && _id && (
          <div className="card-actions justify-center mt-4 gap-4">
            <button
              className="btn btn-error btn-md px-6"
              onClick={() => handleSendRequest("ignored")}
              disabled={!!actionLoading}
              aria-label={`Ignore ${firstName}`}
            >
              {actionLoading === "ignored" ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Ignore"
              )}
            </button>
            <button
              className="btn btn-success btn-md px-6"
              onClick={() => handleSendRequest("interested")}
              disabled={!!actionLoading}
              aria-label={`Show interest in ${firstName}`}
            >
              {actionLoading === "interested" ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Interested"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
