import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchGitHubSummary } from "../services/github";
import { updateProfile, getErrorMessage } from "../services/api";
import { addUser } from "../utils/userSlice";

/**
 * GitHubSection — allows users to connect their GitHub profile.
 * Fetches repos, languages, stars via the public GitHub API.
 * Saves the GitHub data to the user profile for display on cards.
 *
 * Props:
 * - user: current user object (may have user.github already set)
 */
const GitHubSection = ({ user }) => {
  const [username, setUsername] = useState(user?.github?.username || "");
  const [githubData, setGithubData] = useState(user?.github || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  // If user already has GitHub data, show it immediately
  useEffect(() => {
    if (user?.github) {
      setGithubData(user.github);
      setUsername(user.github.username || "");
    }
  }, [user?.github]);

  const handleConnect = async () => {
    if (!username.trim()) {
      setError("Please enter your GitHub username");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const summary = await fetchGitHubSummary(username);
      setGithubData(summary);

      // Save to backend profile
      setSaving(true);
      try {
        const res = await updateProfile({ github: summary });
        dispatch(addUser(res.data.data));
      } catch (err) {
        // Still show data even if backend save fails
        console.warn("Failed to save GitHub data to profile:", getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub data");
      setGithubData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setGithubData(null);
    setUsername("");
    try {
      const res = await updateProfile({ github: null });
      dispatch(addUser(res.data.data));
    } catch {
      // Silently fail
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConnect();
    }
  };

  // Language color mapping (top languages)
  const langColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    "C++": "#f34b7d",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dart: "#00B4AB",
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub Integration
        </h3>
        {githubData && (
          <button
            onClick={handleDisconnect}
            className="btn btn-ghost btn-xs text-error"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Connect Form (shown when not connected) */}
      {!githubData && (
        <div>
          <p className="text-sm opacity-60 mb-3">
            Connect your GitHub to showcase your repos, languages, and contributions on your profile.
          </p>
          <div className="flex gap-2">
            <div className="form-control flex-1">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Your GitHub username"
                className={`input input-bordered input-sm w-full ${error ? "input-error" : ""}`}
                aria-label="GitHub username"
              />
            </div>
            <button
              onClick={handleConnect}
              disabled={loading || saving}
              className="btn btn-primary btn-sm"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Connect"
              )}
            </button>
          </div>
          {error && (
            <p className="text-error text-xs mt-1">{error}</p>
          )}
        </div>
      )}

      {/* GitHub Data Display */}
      {githubData && (
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-3">
            {githubData.avatarUrl && (
              <img
                src={githubData.avatarUrl}
                alt={`${githubData.username}'s GitHub avatar`}
                className="w-12 h-12 rounded-full ring-2 ring-base-content/10"
              />
            )}
            <div className="flex-1">
              <a
                href={githubData.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm hover:text-primary flex items-center gap-1"
              >
                @{githubData.username}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {githubData.bio && (
                <p className="text-xs opacity-60 line-clamp-1">{githubData.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-base-300 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{githubData.publicRepos}</p>
              <p className="text-[10px] opacity-60">Repos</p>
            </div>
            <div className="bg-base-300 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{githubData.totalStars}</p>
              <p className="text-[10px] opacity-60">Stars</p>
            </div>
            <div className="bg-base-300 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{githubData.followers}</p>
              <p className="text-[10px] opacity-60">Followers</p>
            </div>
            <div className="bg-base-300 rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{githubData.following}</p>
              <p className="text-[10px] opacity-60">Following</p>
            </div>
          </div>

          {/* Languages */}
          {githubData.languages && Object.keys(githubData.languages).length > 0 && (
            <div>
              <p className="text-xs font-medium opacity-70 mb-1.5">Top Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(githubData.languages).slice(0, 8).map(([lang, count]) => (
                  <span
                    key={lang}
                    className="badge badge-sm gap-1"
                    style={{
                      backgroundColor: `${langColors[lang] || "#6e7681"}20`,
                      borderColor: langColors[lang] || "#6e7681",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langColors[lang] || "#6e7681" }}
                      aria-hidden="true"
                    />
                    {lang}
                    <span className="opacity-50">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Repos */}
          {githubData.topRepos && githubData.topRepos.length > 0 && (
            <div>
              <p className="text-xs font-medium opacity-70 mb-1.5">Pinned Repos</p>
              <div className="space-y-2">
                {githubData.topRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-base-300 rounded-lg p-2.5 hover:bg-base-300/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-primary">
                        📁 {repo.name}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs opacity-50">
                        ⭐ {repo.stars}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-[11px] opacity-60 mt-0.5 line-clamp-1">
                        {repo.description}
                      </p>
                    )}
                    {repo.language && (
                      <span className="text-[10px] opacity-40 mt-0.5 inline-block">
                        {repo.language}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Last synced info */}
          <p className="text-[10px] opacity-30 text-center">
            Data from GitHub public API • Click "Connect" again to refresh
          </p>
        </div>
      )}
    </div>
  );
};

export default GitHubSection;
