import { useMemo } from "react";

/**
 * ProfileCompleteness - shows a percentage bar of how complete the user's profile is.
 * Gamifies profile completion to encourage users to fill everything out.
 */
const ProfileCompleteness = ({ user }) => {
  const { percentage, missing } = useMemo(() => {
    if (!user) return { percentage: 0, missing: [] };

    const fields = [
      { key: "firstName", label: "First name", weight: 10 },
      { key: "lastName", label: "Last name", weight: 10 },
      { key: "photoUrl", label: "Profile photo", weight: 20 },
      { key: "about", label: "About section", weight: 15 },
      { key: "age", label: "Age", weight: 10 },
      { key: "gender", label: "Gender", weight: 10 },
      { key: "skills", label: "Tech skills", weight: 15, isArray: true },
      { key: "lookingFor", label: "Looking for status", weight: 5 },
      { key: "portfolio", label: "Portfolio projects", weight: 5, isArray: true },
    ];

    let total = 0;
    const missingItems = [];

    for (const field of fields) {
      if (field.isArray) {
        if (user[field.key] && user[field.key].length > 0) {
          total += field.weight;
        } else {
          missingItems.push(field.label);
        }
      } else if (user[field.key]) {
        total += field.weight;
      } else {
        missingItems.push(field.label);
      }
    }

    return { percentage: Math.min(total, 100), missing: missingItems };
  }, [user]);

  const getColor = () => {
    if (percentage >= 80) return "progress-success";
    if (percentage >= 50) return "progress-warning";
    return "progress-error";
  };

  const getEmoji = () => {
    if (percentage === 100) return "🎉";
    if (percentage >= 80) return "🔥";
    if (percentage >= 50) return "💪";
    return "👀";
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">
          {getEmoji()} Profile Completeness
        </h3>
        <span className="text-sm font-bold">{percentage}%</span>
      </div>

      <progress
        className={`progress ${getColor()} w-full`}
        value={percentage}
        max="100"
        aria-label={`Profile ${percentage}% complete`}
      />

      {percentage < 100 && missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs opacity-60 mb-1">Complete your profile by adding:</p>
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 4).map((item) => (
              <span key={item} className="badge badge-outline badge-xs">
                + {item}
              </span>
            ))}
            {missing.length > 4 && (
              <span className="badge badge-outline badge-xs">
                +{missing.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {percentage === 100 && (
        <p className="text-xs text-success mt-2">
          Your profile is complete! You'll get more visibility in the feed.
        </p>
      )}
    </div>
  );
};

export default ProfileCompleteness;
