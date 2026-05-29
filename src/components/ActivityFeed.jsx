import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchActivityFeed, createStory, getErrorMessage } from "../services/api";
import { Spinner, ErrorState, EmptyState } from "./Shimmer";

const ActivityFeed = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStory, setNewStory] = useState("");
  const [posting, setPosting] = useState(false);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchActivityFeed();
      setStories(res.data?.data || res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newStory.trim()) return;

    setPosting(true);
    try {
      const res = await createStory(newStory.trim());
      const story = res.data?.data || res.data || {
        _id: Date.now().toString(),
        content: newStory.trim(),
        author: {
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
        },
        createdAt: new Date().toISOString(),
        likes: [],
      };
      setStories((prev) => [story, ...prev]);
      setNewStory("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <Spinner text="Loading activity..." />;
  if (error) return <ErrorState message={error} onRetry={loadStories} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">📝 Activity Feed</h1>
      <p className="text-sm opacity-60 mb-6">
        Share what you're building today — short updates from the community.
      </p>

      {/* Create Story Form */}
      <form
        onSubmit={handlePost}
        className="bg-base-200 rounded-lg p-4 mb-6"
      >
        <div className="flex gap-3">
          {user?.photoUrl && (
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user.photoUrl}
                alt={`${user.firstName}'s photo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={newStory}
              onChange={(e) => setNewStory(e.target.value)}
              placeholder="What are you building today? Share a quick update..."
              className="textarea textarea-bordered w-full resize-none"
              rows={2}
              maxLength={500}
              aria-label="Write an activity update"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-50">{newStory.length}/500</span>
              <button
                type="submit"
                disabled={!newStory.trim() || posting}
                className="btn btn-primary btn-sm"
              >
                {posting ? <span className="loading loading-spinner loading-xs" /> : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Stories List */}
      {stories.length === 0 ? (
        <EmptyState
          icon="💡"
          title="No activity yet"
          description="Be the first to share what you're building!"
        />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <article
              key={story._id || story.id}
              className="bg-base-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                {story.author?.photoUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={story.author.photoUrl}
                      alt={`${story.author.firstName}'s photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {story.author?.firstName} {story.author?.lastName}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatRelativeTime(story.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{story.content}</p>
                  {story.likes && (
                    <div className="mt-2">
                      <span className="text-xs opacity-50">
                        {story.likes.length > 0 ? `❤️ ${story.likes.length}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
