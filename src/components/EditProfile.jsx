import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName || "");
  const [age, setAge] = useState(user.age || "");
  const [about, setAbout] = useState(user.about || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [gender, setGender] = useState(user.gender || "");
  const [error, setError] = useState();
  const [showToast, setShowToast] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveProfile = async () => {
    setError(null);
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          age,
          about,
          photoUrl,
          gender,
        },
        {
          withCredentials: true,
        }
      );
      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      
    } catch (error) {
      console.log(error);
      setError(error.response.data);
    }
  };

  return (
    <>
      <div className="flex justify-center my-10 -mb-10">
        <div className="flex justify-center mx-10 -mb-10 ">
          <div className="card bg-base-300 w-100 mb-10  shadow-xl ">
            <div className="card-body">
              <h2 className="card-title text-lg font-bold justify-center">
                Edit Profile
              </h2>
              <div>
                <div className="p-2">
                  <span className="lebel-text"> FirstName</span>
                  <input
                    type="text"
                    value={firstName}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="p-2 ">
                  <span className="lebel-text"> lastName</span>

                  <input
                    type="text"
                    value={lastName}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="p-2">
                  <span className="lebel-text"> Age</span>

                  <input
                    type="text"
                    value={age}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="p-2">
                  <span className="lebel-text"> Gender</span>

                  <input
                    type="text"
                    value={gender}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                <div className="p-2">
                  <span className="lebel-text"> photoUrl</span>

                  <input
                    type="text"
                    value={photoUrl}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">About</span>
                  </label>
                  <textarea
                    value={about}
                    className="textarea textarea-bordered w-full"
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-red-500 mt-4 whitespace-normal break-words w-3/4">
                {error}
              </p>
              <div className="card-actions justify-center">
                <button
                  className="btn btn-primary text-lg font-bold"
                  onClick={saveProfile}
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        <UserCard
          user={{ firstName, lastName, age, photoUrl, gender, about }}
        />
      </div>
      <div className="toast toast-top toast-center">
        {showToast && (
          <div className="alert alert-success">
            <span>Saved Successfully.</span>
          </div>
        )}
      </div>
    </>
  );
};

export default EditProfile;
