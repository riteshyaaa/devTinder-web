import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, fetchReceivedRequests } from "../services/api";
import { removeUser } from "../utils/userSlice";
import { markAllAsRead } from "../utils/notificationSlice";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const { unreadCount, unreadMessages, items: notifications } = useSelector(
    (store) => store.notifications
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [requestCount, setRequestCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Fetch request count for badge
  useEffect(() => {
    if (!user) return;
    const getCount = async () => {
      try {
        const res = await fetchReceivedRequests();
        const data = res.data?.data || res.data || [];
        setRequestCount(Array.isArray(data) ? data.length : 0);
      } catch {
        // Silently fail
      }
    };
    getCount();
  }, [user]);

  // Sync with Redux store when requests change
  useEffect(() => {
    if (requests) {
      setRequestCount(Array.isArray(requests) ? requests.length : 0);
    }
  }, [requests]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Logout even if request fails
    }
    dispatch(removeUser());
    navigate("/login");
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const totalBadge = unreadCount + unreadMessages;

  const getNotifIcon = (type) => {
    switch (type) {
      case "match": return "🎉";
      case "request": return "🤝";
      case "message": return "💬";
      case "interest": return "👀";
      default: return "🔔";
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffMs / 86400000)}d`;
  };

  return (
    <nav className="navbar bg-base-100 sticky top-0 z-40 shadow-sm" aria-label="Main navigation">
      <div className="flex-1">
        <Link
          to={user ? "/" : "/login"}
          className="btn btn-ghost text-xl"
          aria-label="DevTinder - Go to home"
        >
          👩‍💻 DevTinder
        </Link>
      </div>

      {user && (
        <div className="flex gap-1 items-center">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Messages Badge */}
          {unreadMessages > 0 && (
            <Link
              to="/connections"
              className="btn btn-ghost btn-sm btn-circle indicator"
              aria-label={`${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="badge badge-primary badge-xs indicator-item">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            </Link>
          )}

          {/* Notification Bell (dropdown) */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-circle indicator"
              aria-label={`Notifications${totalBadge > 0 ? ` (${totalBadge} unread)` : ""}`}
              aria-haspopup="true"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {(unreadCount > 0 || requestCount > 0) && (
                <span className="badge badge-error badge-xs indicator-item animate-pulse">
                  {(unreadCount + requestCount) > 9 ? "9+" : unreadCount + requestCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            <div
              tabIndex={0}
              className="dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-80 max-h-96 overflow-y-auto shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="btn btn-ghost btn-xs text-primary"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-3xl" aria-hidden="true">🔔</span>
                  <p className="text-sm opacity-60 mt-2">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-base-content/5">
                  {notifications.slice(0, 15).map((notif) => (
                    <li
                      key={notif.id}
                      className={`px-4 py-3 flex items-start gap-3 hover:bg-base-300/50 transition-colors ${
                        !notif.read ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Icon / Avatar */}
                      {notif.fromUser?.photoUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={notif.fromUser.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl flex-shrink-0">
                          {getNotifIcon(notif.type)}
                        </span>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight ${!notif.read ? "font-semibold" : ""}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs opacity-60 truncate mt-0.5">
                          {notif.message}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-[10px] opacity-40 flex-shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>

                      {/* Unread indicator */}
                      {!notif.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-base-content/10 text-center">
                  <Link
                    to="/requests"
                    className="text-xs text-primary hover:underline"
                  >
                    View all requests →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Welcome text (hidden on mobile) */}
          <span className="text-sm hidden md:inline mx-2" aria-live="polite">
            Welcome, {user.firstName}
          </span>

          {/* User Avatar Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
              aria-label="Open user menu"
              aria-haspopup="true"
            >
              <div className="w-10 rounded-full">
                <img
                  alt={`${user.firstName}'s profile photo`}
                  src={user.photoUrl}
                  className="object-cover"
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              role="menu"
              aria-label="User menu"
            >
              <li role="none">
                <Link to="/profile" role="menuitem">Profile</Link>
              </li>
              <li role="none">
                <Link to="/connections" role="menuitem">
                  Connections
                  {unreadMessages > 0 && (
                    <span className="badge badge-primary badge-xs">{unreadMessages}</span>
                  )}
                </Link>
              </li>
              <li role="none">
                <Link to="/requests" role="menuitem" className="flex justify-between">
                  Requests
                  {requestCount > 0 && (
                    <span className="badge badge-error badge-xs">{requestCount}</span>
                  )}
                </Link>
              </li>
              <li role="none">
                <Link to="/projects" role="menuitem">Projects Board</Link>
              </li>
              <li role="none">
                <Link to="/activity" role="menuitem">Activity Feed</Link>
              </li>
              <li role="none">
                <Link to="/challenges" role="menuitem">
                  ⚡ Challenges
                </Link>
              </li>
              <li role="none">
                <Link to="/analytics" role="menuitem">
                  📊 Analytics
                </Link>
              </li>
              <li role="none">
                <button onClick={handleLogout} role="menuitem" className="w-full text-left text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
