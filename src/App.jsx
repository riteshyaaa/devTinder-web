import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import ErrorBoundary from "./components/ErrorBoundary";
import { Spinner } from "./components/Shimmer";

// Lazy-loaded components for code splitting
const Body = lazy(() => import("./components/Body"));
const Feed = lazy(() => import("./components/Feed"));
const Login = lazy(() => import("./components/Login"));
const Profile = lazy(() => import("./components/Profile"));
const Connections = lazy(() => import("./components/Connections"));
const Requests = lazy(() => import("./components/Requests"));
const Chat = lazy(() => import("./components/Chat"));
const Onboarding = lazy(() => import("./components/Onboarding"));
const ProjectBoard = lazy(() => import("./components/ProjectBoard"));
const ActivityFeed = lazy(() => import("./components/ActivityFeed"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const CodingChallenges = lazy(() => import("./components/CodingChallenges"));
const ProfileAnalytics = lazy(() => import("./components/ProfileAnalytics"));
const NotFound = lazy(() => import("./components/NotFound"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));

function App() {
  return (
    <ErrorBoundary>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Suspense fallback={<Spinner text="Loading..." />}>
            <Routes>
              {/* Standalone pages (no NavBar/Footer) */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/welcome" element={<LandingPage />} />

              {/* Main app layout */}
              <Route path="/" element={<Body />}>
                <Route index element={<Feed />} />
                <Route path="login" element={<Login />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="profile" element={<Profile />} />
                <Route path="connections" element={<Connections />} />
                <Route path="requests" element={<Requests />} />
                <Route path="chat/:targetId" element={<Chat />} />
                <Route path="projects" element={<ProjectBoard />} />
                <Route path="activity" element={<ActivityFeed />} />
                <Route path="challenges" element={<CodingChallenges />} />
                <Route path="analytics" element={<ProfileAnalytics />} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
