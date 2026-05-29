import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import LandingPage from "./LandingPage";
import useAuth from "../hooks/useAuth";
import { Spinner } from "./Shimmer";

const Body = () => {
  const { user, loading, fetchUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  // Show loading spinner during initial auth check
  if (loading && !user) {
    return <Spinner text="Loading DevTinder..." />;
  }

  // Show landing page for logged-out users (except on /login route)
  if (!user && !location.pathname.includes("login")) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
