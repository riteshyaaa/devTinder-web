import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, fetchReceivedRequests } from "../services/api";
import { removeUser } from "../utils/userSlice";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [requestCount, setRequestCount] = useState(0);

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

          {/* Requests with badge */}
          <Link
            to="/requests"
            className="btn btn-ghost btn-sm btn-circle indicator"
            aria-label={`Connection requests${requestCount > 0 ? ` (${requestCount} pending)` : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {requestCount > 0 && (
              <span className="badge badge-error badge-xs indicator-item">
                {requestCount > 9 ? "9+" : requestCount}
              </span>
            )}
          </Link>

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
                <Link to="/profile" role="menuitem">
                  Profile
                </Link>
              </li>
              <li role="none">
                <Link to="/connections" role="menuitem">
                  Connections
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
                <Link to="/projects" role="menuitem">
                  Projects Board
                </Link>
              </li>
              <li role="none">
                <Link to="/activity" role="menuitem">
                  Activity Feed
                </Link>
              </li>
              <li role="none">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full text-left text-error"
                >
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
