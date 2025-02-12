import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequest, removeRequest } from "../utils/requestSlice";
import axios from "axios";
import { useEffect } from "react";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);

  const reviewRequest = async (status, _id) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        {
          withCredentials: true,
        }
      );
 dispatch(removeRequest( _id));
    } 
    catch (error) {}
  };

  const fetschRequest = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      
      dispatch(addRequest(res.data.data));
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    fetschRequest();
  }, []);

  if (!requests) return;
  if (requests.length == 0) return <h2 className="flex justify-center text-lg"> No Request found.</h2>;

  return (
    requests && (
      <div className="text-center my-10">
        <h2 className="text-3xl"> Connection Requests</h2>
        {requests.map((request) => {
          const { firstName, lastName, age, gender, photoUrl, about, _id } =
            request.fromUserId;

          return (
            <div
              className="bg-base-300 m-4 flex w-6/12 rounded-full  mx-auto"
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
                <h2 className=" font-bold text-lg mt-2">
                  {firstName + " " + lastName}{" "}
                </h2>
                {age && gender && (
                  <p className=" text-xl "> {age + ", " + gender}</p>
                )}
                <p>{about} </p>
              </div>
              <div className="flex-1 space-x-4  justify-end ">
                <button
                  className="bg-green-500 text-white px-4 my-6  rounded-full hover:bg-green-600"
                  onClick={() => reviewRequest("accepted", request._id)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-4 my-6  justify-end rounded-full hover:bg-red-600"
                  onClick={() => reviewRequest("rejected", request._id)}
                >
                  Ignore
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )
  );
};

export default Requests;
