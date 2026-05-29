import { useEffect } from "react";
import useRequests from "../hooks/useRequests";
import { ListSkeleton, ErrorState, EmptyState } from "./Shimmer";

const Requests = () => {
  const { requests, loading, error, getRequests, reviewRequest, retry } = useRequests();

  useEffect(() => {
    getRequests();
  }, []);

  if (loading && !requests) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon="📬"
        title="No pending requests"
        description="When someone sends you a connection request, it will appear here."
      />
    );
  }

  return (
    <div className="text-center my-10">
      <h2 className="text-3xl font-bold mb-6">Connection Requests</h2>
      {requests.map((request) => {
        const { firstName, lastName, age, gender, photoUrl, about, _id } =
          request.fromUserId;

        return (
          <div
            className="bg-base-300 m-4 flex flex-col sm:flex-row w-full sm:w-10/12 md:w-6/12 rounded-lg mx-auto p-4"
            key={_id}
          >
            <div className="flex items-center">
              <img
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
                alt={`${firstName} ${lastName}'s profile photo`}
              />
            </div>
            <div className="text-left mx-4 flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg">
                {firstName} {lastName}
              </h3>
              {age && gender && (
                <p className="text-sm opacity-70">{age}, {gender}</p>
              )}
              {about && <p className="text-sm line-clamp-2">{about}</p>}
            </div>
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                className="btn btn-success btn-sm"
                onClick={() => reviewRequest("accepted", request._id)}
                aria-label={`Accept connection request from ${firstName}`}
              >
                Accept
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => reviewRequest("rejected", request._id)}
                aria-label={`Reject connection request from ${firstName}`}
              >
                Ignore
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
