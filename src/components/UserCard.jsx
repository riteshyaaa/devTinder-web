import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { firstName, lastName, age, about, gender, photoUrl, _id} = user;

  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
         dispatch(removeUserFromFeed(userId));
    } catch (error) {
      
    }
    
  };
   

  return (
    <div className="card bg-base-300 w-96 shadow-xl">
      <figure>
        <img src={photoUrl} alt="user photoUrl" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{firstName + " " + lastName}</h2>
        {age && gender && <p>{age + " ," + gender} </p>}
        <p>{about}</p>
        <div className="card-actions justify-end m-10 ">
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded transition duration-300 hover:bg-blue-600"
            onClick={() => handleSendRequest("interested", _id)}
          >
            Interested
          </button>
          <button
            className="px-4 py-2 text-white bg-pink-500 rounded transition duration-300 hover:bg-red-500"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            ignored
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
