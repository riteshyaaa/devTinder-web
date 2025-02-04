import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("arya@gmail.com");
  const [password, setPassword] = useState("Arya@123");

  const handleSubmit = async () => {
    
    try {
     
      const res = await axios.post(
        "http://localhost:3000/login",
        {
          email,
          password
        },
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg font-bold justify-center">LogIN</h2>
          <div>
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
                type="text"
                value={password}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="card-actions justify-center">
            <button
              className="btn btn-primary text-lg font-bold"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
