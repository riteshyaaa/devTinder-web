import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import useAuth from "../hooks/useAuth";
import { Spinner } from "./Shimmer";

const Body = () => {
  const { user, loading, fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading && !user) {
    return <Spinner text="Loading DevTinder..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
