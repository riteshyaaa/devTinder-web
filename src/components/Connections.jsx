import { useEffect } from "react";
import { Link } from "react-router-dom";
import useConnections from "../hooks/useConnections";
import { ListSkeleton, ErrorState, EmptyState } from "./Shimmer";

const Connections = () => {
  const { connections, loading, error, getConnections, retry } = useConnections();

  useEffect(() => {
    getConnections();
  }, []);

  if (loading && !connections) {
    return <ListSkeleton count={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (!connections || connections.length === 0) {
    return (
      <EmptyState
        icon="🤝"
        title="No connections yet"
        description="Start swiping to connect with other developers!"
        action={{ label: "Go to Feed", onClick: () => window.location.href = "/" }}
      />
    );
  }

  return (
    <div className="text-center my-10">
      <h2 className="text-2xl font-bold mb-4">Connections</h2>
      {connections.map((connection) => {
        const { firstName, lastName, age, gender, photoUrl, about, _id } = connection;
        return (
          <div
            className="bg-base-300 m-4 flex w-full rounded md:w-6/12 mx-auto h-24 md:h-32"
            key={_id}
          >
            <div className="flex items-center p-3">
              <img
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
                alt={`${firstName} ${lastName}'s profile photo`}
              />
            </div>
            <div className="text-left mx-4 flex flex-col justify-center flex-1">
              <h3 className="font-bold text-lg">
                {firstName} {lastName}
              </h3>
              {age && gender && (
                <p className="text-sm opacity-70">{age}, {gender}</p>
              )}
              {about && <p className="text-sm line-clamp-2">{about}</p>}
            </div>
            <div className="flex flex-col justify-center p-4">
              <Link to={`/chat/${_id}`}>
                <button className="btn btn-secondary btn-sm">Chat</button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
