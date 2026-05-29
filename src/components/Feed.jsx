import  { useEffect, useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });

      dispatch(addFeed(res.data));
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to load feed";
      setError(message);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (error) return <div className="text-center text-red-500 text-xl my-10">{error}</div>;
  if (!feed) return;
  if (feed.length <= 0) return <div className="text-center text-2xl my-10">No more users found</div>;
  return (
    <div className="flex justify-center my-10">
      <UserCard user={feed[0]} />
    </div>
  );
};

export default Feed;
