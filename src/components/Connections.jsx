import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice.jsx";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      console.log(res.data.data);
      dispatch(addConnections(res.data.data));
    } catch (error) {}
  };
  useEffect(() => {
    fetchConnections();
    if (!connections) return;
    if (connections.length == 0) return <h2> No connections found.</h2>;
  }, []);
  return (
    connections && (
      <div className="text-center my-10">
        <h2 className="text-2xl"> Connections</h2>
        {connections.map((connection) => {
          const { firstName, lastName, age, gender, photoUrl, about, _id } =
            connection;
          return (
            <div
              className="bg-base-300 m-4 flex w-4/12 rounded-full  mx-auto"
              key={_id}
            >
              <div>
                <img
                  className="w-20 h-20 rounded-full "
                  src={photoUrl}
                  alt="photoUrl"
                />
              </div>
              <div className="text-left mx-4">
                <h2 className=" font-bold text-lg">
                  {firstName + " " + lastName}{" "}
                </h2>
                {age && gender && (
                  <p className=" text-xl "> {age + ", " + gender}</p>
                )}
                <p>{about} </p>
              </div>
            </div>
          );
        })}
      </div>
    )
  );
};

export default Connections;
