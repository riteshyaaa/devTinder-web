import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchProjects, createProject, applyToProject, getErrorMessage } from "../services/api";
import { Spinner, ErrorState, EmptyState } from "./Shimmer";

const ProjectBoard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    lookingFor: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProjects();
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        techStack: formData.techStack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        lookingFor: formData.lookingFor.trim(),
      };
      const res = await createProject(payload);
      const newProject = res.data?.data || res.data;
      setProjects((prev) => [newProject, ...prev]);
      setFormData({ title: "", description: "", techStack: "", lookingFor: "" });
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (projectId) => {
    setApplyingTo(projectId);
    try {
      await applyToProject(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? { ...p, applicants: [...(p.applicants || []), user._id] }
            : p
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplyingTo(null);
    }
  };

  if (loading) return <Spinner text="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={loadProjects} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🚀 Project Board</h1>
          <p className="text-sm opacity-60">
            Post your project ideas and find collaborators
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary btn-sm"
        >
          {showForm ? "Cancel" : "+ Post Project"}
        </button>
      </div>

      {/* Create Project Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-base-200 rounded-lg p-4 mb-6 space-y-3"
        >
          <div className="form-control">
            <label className="label py-0" htmlFor="project-title">
              <span className="label-text text-sm">Project Title *</span>
            </label>
            <input
              id="project-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Real-time Code Editor"
              className="input input-bordered input-sm w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="project-desc">
              <span className="label-text text-sm">Description</span>
            </label>
            <textarea
              id="project-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're building and what stage it's at..."
              className="textarea textarea-bordered textarea-sm w-full"
              rows={3}
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="project-tech">
              <span className="label-text text-sm">Tech Stack (comma separated)</span>
            </label>
            <input
              id="project-tech"
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              placeholder="React, Node.js, Socket.IO"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="form-control">
            <label className="label py-0" htmlFor="project-looking">
              <span className="label-text text-sm">Looking for</span>
            </label>
            <input
              id="project-looking"
              type="text"
              value={formData.lookingFor}
              onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
              placeholder="e.g. Backend developer, UI designer"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
            {submitting ? <span className="loading loading-spinner loading-xs" /> : "Post Project"}
          </button>
        </form>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No projects yet"
          description="Be the first to post a project idea and find collaborators!"
          action={{ label: "Post a Project", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const hasApplied = project.applicants?.includes(user?._id);
            const isOwner = project.userId === user?._id || project.owner?._id === user?._id;
            return (
              <div
                key={project._id || project.id}
                className="bg-base-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    {project.owner && (
                      <p className="text-xs opacity-60">
                        by {project.owner.firstName} {project.owner.lastName}
                      </p>
                    )}
                  </div>
                  {!isOwner && (
                    <button
                      onClick={() => handleApply(project._id)}
                      disabled={hasApplied || applyingTo === project._id}
                      className={`btn btn-sm ${hasApplied ? "btn-disabled" : "btn-primary"}`}
                    >
                      {applyingTo === project._id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : hasApplied ? (
                        "✓ Applied"
                      ) : (
                        "I'm Interested"
                      )}
                    </button>
                  )}
                </div>

                {project.description && (
                  <p className="text-sm mt-2 opacity-80">{project.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.techStack?.map((tech) => (
                    <span key={tech} className="badge badge-primary badge-sm">
                      {tech}
                    </span>
                  ))}
                </div>

                {project.lookingFor && (
                  <p className="text-xs mt-2 opacity-60">
                    🔍 Looking for: {project.lookingFor}
                  </p>
                )}

                {project.applicants?.length > 0 && (
                  <p className="text-xs mt-1 opacity-50">
                    {project.applicants.length} developer{project.applicants.length > 1 ? "s" : ""} interested
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
