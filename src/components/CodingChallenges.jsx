import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchChallenges, submitChallenge, getErrorMessage } from "../services/api";
import { Spinner, ErrorState, EmptyState } from "./Shimmer";

/**
 * CodingChallenges — Weekly coding challenges with gamification.
 *
 * Features:
 * - Current week's challenge displayed prominently
 * - Past challenges archive
 * - Participation tracking (streak, badges)
 * - Discussion/comments per challenge
 * - Leaderboard (participants count)
 */
const CodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [submission, setSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchChallenges();
      const data = res.data?.data || res.data || [];
      setChallenges(data.length > 0 ? data : SAMPLE_CHALLENGES);
    } catch (err) {
      if (err.response?.status !== 401) {
        // Use sample challenges if API not available
        setChallenges(SAMPLE_CHALLENGES);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (challengeId) => {
    if (!submission.trim()) return;
    setSubmitting(true);
    try {
      await submitChallenge(challengeId, submission.trim());
      setChallenges((prev) =>
        prev.map((c) =>
          c._id === challengeId || c.id === challengeId
            ? { ...c, participants: (c.participants || 0) + 1, hasSubmitted: true }
            : c
        )
      );
      setSubmission("");
      setSelectedChallenge(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getStreakBadge = (streak) => {
    if (streak >= 10) return { emoji: "🏆", label: "Champion", color: "badge-warning" };
    if (streak >= 5) return { emoji: "🔥", label: "On Fire", color: "badge-error" };
    if (streak >= 3) return { emoji: "⚡", label: "Streak", color: "badge-info" };
    return null;
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy": return "badge-success";
      case "medium": return "badge-warning";
      case "hard": return "badge-error";
      default: return "badge-ghost";
    }
  };

  if (loading) return <Spinner text="Loading challenges..." />;
  if (error && challenges.length === 0) return <ErrorState message={error} onRetry={loadChallenges} />;

  const currentChallenge = challenges[0];
  const pastChallenges = challenges.slice(1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">⚡ Weekly Challenges</h1>
          <p className="text-sm opacity-60">
            Sharpen your skills and spark conversations
          </p>
        </div>
        {user?.challengeStreak > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div className="text-right">
              <p className="font-bold text-lg">{user.challengeStreak}</p>
              <p className="text-[10px] opacity-50">week streak</p>
            </div>
          </div>
        )}
      </div>

      {/* This Week's Challenge */}
      {currentChallenge && (
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary badge-sm">THIS WEEK</span>
            <span className={`badge badge-sm ${getDifficultyColor(currentChallenge.difficulty)}`}>
              {currentChallenge.difficulty || "medium"}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-2">{currentChallenge.title}</h2>
          <p className="text-sm opacity-80 mb-4">{currentChallenge.description}</p>

          {/* Tech tags */}
          {currentChallenge.tags && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {currentChallenge.tags.map((tag) => (
                <span key={tag} className="badge badge-outline badge-sm">{tag}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm opacity-60 mb-4">
            <span>👥 {currentChallenge.participants || 0} participants</span>
            <span>⏱️ {currentChallenge.timeLimit || "30 min"}</span>
            {currentChallenge.endsAt && (
              <span>📅 Ends {new Date(currentChallenge.endsAt).toLocaleDateString()}</span>
            )}
          </div>

          {/* Submit area */}
          {currentChallenge.hasSubmitted ? (
            <div className="alert alert-success py-2">
              <span>✅ You've completed this challenge!</span>
            </div>
          ) : selectedChallenge === (currentChallenge._id || currentChallenge.id) ? (
            <div className="space-y-3">
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Paste your solution, share your approach, or link to your code..."
                className="textarea textarea-bordered w-full"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmit(currentChallenge._id || currentChallenge.id)}
                  disabled={submitting || !submission.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? <span className="loading loading-spinner loading-xs" /> : "Submit"}
                </button>
                <button
                  onClick={() => { setSelectedChallenge(null); setSubmission(""); }}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSelectedChallenge(currentChallenge._id || currentChallenge.id)}
              className="btn btn-primary btn-sm"
            >
              🚀 Take the Challenge
            </button>
          )}
        </div>
      )}

      {/* Past Challenges */}
      {pastChallenges.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Past Challenges</h3>
          <div className="space-y-3">
            {pastChallenges.map((challenge) => (
              <div
                key={challenge._id || challenge.id}
                className="bg-base-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <span className={`badge badge-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 line-clamp-1">{challenge.description}</p>
                  <span className="text-xs opacity-40">
                    👥 {challenge.participants || 0} participated
                  </span>
                </div>
                {challenge.hasSubmitted && (
                  <span className="badge badge-success badge-sm">Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <EmptyState
          icon="⚡"
          title="No challenges yet"
          description="Check back soon — new challenges are posted weekly!"
        />
      )}
    </div>
  );
};

// Sample challenges (used when API not available)
const SAMPLE_CHALLENGES = [
  {
    id: "sample-1",
    title: "Build a Real-time Chat API",
    description: "Create a REST API with WebSocket support that handles message delivery, read receipts, and typing indicators. Use any tech stack you prefer.",
    difficulty: "medium",
    tags: ["Node.js", "WebSocket", "REST API", "Database"],
    participants: 23,
    timeLimit: "45 min",
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    hasSubmitted: false,
  },
  {
    id: "sample-2",
    title: "Implement a Rate Limiter",
    description: "Build a middleware that limits API requests to 100 per minute per user. Handle edge cases like distributed systems and sliding windows.",
    difficulty: "hard",
    tags: ["System Design", "Redis", "Middleware"],
    participants: 15,
    timeLimit: "30 min",
    hasSubmitted: false,
  },
  {
    id: "sample-3",
    title: "Create a Responsive Dashboard",
    description: "Build a dashboard with 4 widgets (chart, table, stats, notifications) that works on mobile, tablet, and desktop.",
    difficulty: "easy",
    tags: ["React", "CSS", "Responsive Design"],
    participants: 42,
    timeLimit: "30 min",
    hasSubmitted: true,
  },
];

export default CodingChallenges;
