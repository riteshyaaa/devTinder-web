import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile, getErrorMessage } from "../services/api";
import { addUser } from "../utils/userSlice";

/**
 * PortfolioSection - lets users pin their best projects to their profile.
 */
const PortfolioSection = ({ user }) => {
  const [projects, setProjects] = useState(user?.portfolio || []);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleAdd = async () => {
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      techStack: techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const updated = [...projects, newProject];
    setSaving(true);
    setError("");

    try {
      const res = await updateProfile({ portfolio: updated });
      dispatch(addUser(res.data.data));
      setProjects(updated);
      setTitle("");
      setDescription("");
      setUrl("");
      setTechStack("");
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    const updated = projects.filter((p) => p.id !== id);
    try {
      const res = await updateProfile({ portfolio: updated });
      dispatch(addUser(res.data.data));
      setProjects(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">📂 Portfolio Projects</h3>
        {projects.length < 5 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-ghost btn-xs"
          >
            {showForm ? "Cancel" : "+ Add Project"}
          </button>
        )}
      </div>

      {/* Project List */}
      {projects.length === 0 && !showForm && (
        <p className="text-sm opacity-60">
          No projects pinned yet. Add your best work to showcase to other developers!
        </p>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-base-300 rounded-lg p-3 flex items-start gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{project.title}</h4>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline"
                    aria-label={`Visit ${project.title}`}
                  >
                    ↗ Link
                  </a>
                )}
              </div>
              {project.description && (
                <p className="text-xs opacity-70 mt-1">{project.description}</p>
              )}
              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="badge badge-primary badge-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleRemove(project.id)}
              className="btn btn-ghost btn-xs text-error"
              aria-label={`Remove ${project.title}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add Project Form */}
      {showForm && (
        <div className="bg-base-300 rounded-lg p-4 mt-3 space-y-3">
          <div className="form-control">
            <label className="label py-0" htmlFor="portfolio-title">
              <span className="label-text text-xs">Title *</span>
            </label>
            <input
              id="portfolio-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="portfolio-desc">
              <span className="label-text text-xs">Description</span>
            </label>
            <input
              id="portfolio-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what it does"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="portfolio-url">
              <span className="label-text text-xs">URL</span>
            </label>
            <input
              id="portfolio-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="portfolio-tech">
              <span className="label-text text-xs">Tech Stack (comma separated)</span>
            </label>
            <input
              id="portfolio-tech"
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Node.js, MongoDB"
              className="input input-bordered input-sm w-full"
            />
          </div>

          {error && <p className="text-error text-xs">{error}</p>}

          <button
            onClick={handleAdd}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? <span className="loading loading-spinner loading-xs" /> : "Add Project"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;
