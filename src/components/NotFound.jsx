import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * NotFound — Branded 404 error page.
 * Shows when user navigates to a non-existent route.
 */
const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 404 Illustration */}
        <motion.div
          className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent select-none"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          404
        </motion.div>

        <motion.div
          className="text-6xl my-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          aria-hidden="true"
        >
          🔍
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-base-content/60 mb-6">
          Looks like this page swiped left on you. The URL you're looking for
          doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            Go to Feed
          </Link>
          <Link to="/connections" className="btn btn-ghost">
            View Connections
          </Link>
        </div>

        <p className="text-xs opacity-40 mt-8">
          DevTinder — Find your coding partner
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
