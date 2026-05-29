import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-br from-base-300 via-base-100 to-base-300">
        <div className="hero-content text-center flex-col max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Find your next{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                coding partner
              </span>
            </h1>
            <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto opacity-80">
              DevTinder connects developers who share your passion. Swipe, match,
              and collaborate on projects, find mentors, or build your next startup
              together.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started — It's Free
            </Link>
            <a href="#features" className="btn btn-ghost btn-lg">
              Learn More ↓
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-8 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1000+</p>
              <p className="text-xs opacity-60">Developers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">500+</p>
              <p className="text-xs opacity-60">Matches Made</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">50+</p>
              <p className="text-xs opacity-60">Projects Started</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why developers love DevTinder
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: "🎯",
                title: "Skill-Based Matching",
                desc: "Get matched with developers who complement your skills. Frontend meets backend. Mentor meets mentee.",
              },
              {
                emoji: "💬",
                title: "Real-time Chat",
                desc: "Share code snippets, discuss ideas, and plan projects together with built-in syntax highlighting.",
              },
              {
                emoji: "🚀",
                title: "Project Collaboration",
                desc: "Post project ideas, find co-founders, and build something amazing with your new connections.",
              },
              {
                emoji: "👥",
                title: "Swipe to Connect",
                desc: "Like Tinder, but for code. Swipe right on developers you'd like to work with.",
              },
              {
                emoji: "📂",
                title: "Portfolio Showcase",
                desc: "Pin your best projects and let your work speak for itself. No resumes needed.",
              },
              {
                emoji: "🌐",
                title: "Global Community",
                desc: "Connect with developers worldwide. Remote-friendly, timezone-aware matching.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="card bg-base-200 p-6 text-center"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <span className="text-4xl mb-3 block" aria-hidden="true">
                  {feature.emoji}
                </span>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm opacity-70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-base-200">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to find your dev match?
          </h2>
          <p className="opacity-70 mb-8">
            Join thousands of developers who are already connecting, collaborating,
            and building together.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Create Your Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
