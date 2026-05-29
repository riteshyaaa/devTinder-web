/**
 * GitHub Public API integration.
 * Fetches user profile, repos, languages, and contribution stats
 * using the unauthenticated GitHub REST API (60 requests/hour limit).
 */

const GITHUB_API = "https://api.github.com";

/**
 * Fetch a GitHub user's public profile.
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - { login, name, avatar_url, bio, public_repos, followers, following, html_url, created_at }
 */
export const fetchGitHubProfile = async (username) => {
  const res = await fetch(`${GITHUB_API}/users/${username}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("GitHub user not found");
    if (res.status === 403) throw new Error("GitHub API rate limit reached. Try again later.");
    throw new Error("Failed to fetch GitHub profile");
  }
  return res.json();
};

/**
 * Fetch a user's public repositories (sorted by stars, top 10).
 * @param {string} username
 * @returns {Promise<Array>} - [{ name, description, stargazers_count, language, html_url, fork, updated_at }]
 */
export const fetchGitHubRepos = async (username) => {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=stars&per_page=10&direction=desc`
  );
  if (!res.ok) throw new Error("Failed to fetch repositories");
  return res.json();
};

/**
 * Aggregate language stats from a user's repos.
 * @param {Array} repos - Array of repo objects
 * @returns {Object} - { JavaScript: 5, Python: 3, ... } (count of repos per language)
 */
export const aggregateLanguages = (repos) => {
  const langMap = {};
  repos.forEach((repo) => {
    if (repo.language && !repo.fork) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });
  // Sort by count descending
  return Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [lang, count]) => {
      acc[lang] = count;
      return acc;
    }, {});
};

/**
 * Calculate total stars across all repos.
 * @param {Array} repos
 * @returns {number}
 */
export const getTotalStars = (repos) => {
  return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
};

/**
 * Fetch all GitHub data for a username and return a summary object.
 * @param {string} username
 * @returns {Promise<Object>} - Full GitHub summary
 */
export const fetchGitHubSummary = async (username) => {
  if (!username || !username.trim()) throw new Error("Username is required");

  const cleanUsername = username.trim().replace(/^@/, "");

  const [profile, repos] = await Promise.all([
    fetchGitHubProfile(cleanUsername),
    fetchGitHubRepos(cleanUsername),
  ]);

  const languages = aggregateLanguages(repos);
  const totalStars = getTotalStars(repos);
  const topRepos = repos
    .filter((r) => !r.fork)
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      url: r.html_url,
      updatedAt: r.updated_at,
    }));

  return {
    username: profile.login,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    profileUrl: profile.html_url,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    createdAt: profile.created_at,
    totalStars,
    languages,
    topRepos,
  };
};
