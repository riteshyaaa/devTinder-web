import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(addUser(res.data));

      return navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error); 
    }
  };
  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signUp",
        { firstName, lastName, email, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      return navigate("/profile");
    } catch (error) {
      setError(error?.response?.data?.error);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg font-bold justify-center">
            {isLogin ? "LogIN" : "SignUP"}
          </h2>
          <div>
            {!isLogin && (
              <>
                <div className="p-2">
                  First Name
                  <input
                    type="text"
                    value={firstName}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="p-2">
                  Last Name
                  <input
                    type="text"
                    value={lastName}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="p-2">
              Email ID
              <input
                type="text"
                value={email}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="p-2">
              Password
              <input
                type="password"
                value={password}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <p className="text-red-500"> {error} </p>
          <div className="card-actions justify-center">
            <button
              className="btn btn-primary text-lg font-bold"
              onClick={isLogin ? handleLogin : handleSignUp}
            >
              {isLogin ? "Login" : "SignUp"}
            </button>
          </div>
          <p
            className="text-white-500 cursor-pointer text-center text-lg"
            onClick={() => setIsLogin(!isLogin)}
          >
            {" "}
            {isLogin
              ? "New User? SignUp "
              : "Already have an account? Login "}{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
