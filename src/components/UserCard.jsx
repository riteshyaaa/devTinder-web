import { useState } from "react";

const UserCard = ({ user, onSwipe }) => {
  const { firstName, lastName, age, about, gender, photoUrl, _id } = user;
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
        {age && gender && <p className="opacity-70">{age}, {gender}</p>}
        {about && <p className="text-sm">{about}</p>}
        <div className="card-actions justify-center mt-6 gap-4">
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
      </div>
    </div>
  );
};

export default UserCard;
