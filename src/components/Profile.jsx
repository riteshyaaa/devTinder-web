import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import ProfileCompleteness from "./ProfileCompleteness";
import PortfolioSection from "./PortfolioSection";
import LookingForSection from "./LookingForSection";

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Completeness Bar */}
      <ProfileCompleteness user={user} />

      {/* Looking For Status */}
      <LookingForSection user={user} />

      {/* Portfolio Showcase */}
      <PortfolioSection user={user} />

      {/* Edit Profile Form */}
      <EditProfile user={user} />
    </div>
  );
};

export default Profile;
