import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await axios.post(BASE_URL + "/logout", {}, { withCredentials: true })
    dispatch(removeUser())
    navigate("/login");

  };
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to={user ? "/" : undefined} className="btn btn-ghost text-xl">
          👩‍💻DevTinder
        </Link>
      </div>
      {user && (
        <div className="flex-none gap-1 ">
          <div className="flex items-center gap-x-1">
            {" "}
            Welcome, {user.firstName}
          </div>
          <div className="dropdown dropdown-end mx-2 ">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full ">
                <Link >
                  <img
                    alt="Tailwind CSS Navbar component"
                    src={user.photoUrl}
                  />
                </Link>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                
                </Link>
              </li>
              <li>
                <Link to = "/connections ">connections</Link>
              </li>
              <li>
                <Link to = "/requests ">Requests</Link>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
