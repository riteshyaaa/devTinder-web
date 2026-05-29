import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useConnections from "../hooks/useConnections";
import { getSocket } from "../utils/socket";
import { ListSkeleton, ErrorState, EmptyState, ListItemSkeleton } from "./Shimmer";
import Avatar from "./Avatar";

const Connections = () => {
  const { connections, loading, error, getConnections, retry } = useConnections();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(10); // Infinite scroll batch size
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    getConnections();
  }, []);

  // Debounced search (300ms)
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setVisibleCount(10); // Reset pagination on new search
    }, 300);
  }, []);

  // Listen for online status updates
  useEffect(() => {
    const socket = getSocket();

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("onlineUsers", ({ users }) => {
      setOnlineUsers(new Set(users));
    });

    if (connections?.length > 0) {
      const ids = connections.map((c) => c._id);
      socket.emit("getOnlineUsers", { userIds: ids });
    }

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("onlineUsers");
    };
  }, [connections]);

  // Filtered and sorted connections
  const filteredConnections = useMemo(() => {
    if (!connections) return [];

    let result = [...connections];

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.firstName?.toLowerCase().includes(query) ||
          c.lastName?.toLowerCase().includes(query) ||
          c.skills?.some((s) => s.toLowerCase().includes(query)) ||
          c.about?.toLowerCase().includes(query)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => (a.firstName || "").localeCompare(b.firstName || ""));
    } else if (sortBy === "recent") {
      result.sort((a, b) => {
        const aOnline = onlineUsers.has(a._id) ? 0 : 1;
        const bOnline = onlineUsers.has(b._id) ? 0 : 1;
        if (aOnline !== bOnline) return aOnline - bOnline;
        return (a.firstName || "").localeCompare(b.firstName || "");
      });
    }

    return result;
  }, [connections, debouncedQuery, sortBy, onlineUsers]);

  // Paginated slice for infinite scroll
  const visibleConnections = useMemo(
    () => filteredConnections.slice(0, visibleCount),
    [filteredConnections, visibleCount]
  );
  const hasMore = visibleCount < filteredConnections.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          // Simulate slight delay for smooth UX
          setTimeout(() => {
            setVisibleCount((prev) => prev + 10);
            setLoadingMore(false);
          }, 200);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, visibleCount]);

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
        action={{ label: "Go to Feed", onClick: () => (window.location.href = "/") }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Connections</h2>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="form-control flex-1">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or skill..."
              className="input input-bordered input-sm w-full pl-9"
              aria-label="Search connections"
            />
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select select-bordered select-sm"
          aria-label="Sort connections"
        >
          <option value="name">Sort: A-Z</option>
          <option value="recent">Sort: Online First</option>
        </select>
      </div>

      {/* Results count */}
      {debouncedQuery && (
        <p className="text-xs opacity-60 mb-3">
          {filteredConnections.length} result{filteredConnections.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Connection List with Infinite Scroll */}
      {filteredConnections.length === 0 ? (
        <div className="text-center py-10 opacity-60">
          <p>No connections match "{debouncedQuery}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleConnections.map((connection) => {
            const { firstName, lastName, age, gender, photoUrl, about, skills, _id } = connection;
            const isOnline = onlineUsers.has(_id);

            return (
              <div
                className="bg-base-200 flex items-center rounded-lg p-3 gap-3 hover:bg-base-300 transition-colors"
                key={_id}
              >
                {/* Avatar with online indicator + initials fallback */}
                <Avatar
                  firstName={firstName}
                  lastName={lastName}
                  photoUrl={photoUrl}
                  size="md"
                  isOnline={isOnline}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {firstName} {lastName}
                    </h3>
                    {isOnline && (
                      <span className="text-xs text-success">online</span>
                    )}
                  </div>
                  {age && gender && (
                    <p className="text-xs opacity-60">{age}, {gender}</p>
                  )}
                  {about && (
                    <p className="text-xs opacity-50 truncate">{about}</p>
                  )}
                  {skills?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="badge badge-xs badge-primary badge-outline">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="badge badge-xs badge-ghost">+{skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Button */}
                <Link to={`/chat/${_id}`} className="flex-shrink-0">
                  <button className="btn btn-primary btn-sm" aria-label={`Chat with ${firstName}`}>
                    💬 Chat
                  </button>
                </Link>
              </div>
            );
          })}

          {/* Infinite scroll sentinel + loading indicator */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4">
              {loadingMore && <ListItemSkeleton />}
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && filteredConnections.length > 10 && (
            <p className="text-center text-xs opacity-40 py-4">
              — You've reached the end —
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;
