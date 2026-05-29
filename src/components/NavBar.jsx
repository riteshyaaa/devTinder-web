import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { useDispatch } from "react-redux";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Logout even if request fails (token may be expired)
    }
    dispatch(removeUser());
    navigate("/login");
  };

  return (
    <nav className="navbar bg-base-100" aria-label="Main navigation">
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
        <div className="flex gap-2 items-center">
          <span className="text-sm hidden sm:inline" aria-live="polite">
            Welcome, {user.firstName}
          </span>

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
                <Link to="/requests" role="menuitem">
                  Requests
                </Link>
              </li>
              <li role="none">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full text-left"
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
