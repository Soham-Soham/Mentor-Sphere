import { useDispatch, useSelector } from "react-redux";
import { Mail, UserRound, LogOut } from "lucide-react";
import { logoutUser } from "../redux/slices/authSlice.js";
import axios from "axios";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

    const logoutHandle = async () => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`,
      {},
      { withCredentials: true }
    );
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-blue-200 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white transition-colors duration-500">
      {/* Header Gradient Section */}
      <div className="w-full h-56 sm:h-64 bg-gradient-to-r from-blue-500 to-indigo-400 dark:from-blue-800 dark:to-indigo-700 flex items-center justify-center shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wide text-white drop-shadow-lg">
          My Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] -mt-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center transition-all duration-500">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user?.avatar || "https://via.placeholder.com/150"}
            alt="User Avatar"
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
          />
          <div className="absolute -bottom-2 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>

        {/* User Info */}
        <div className="mt-6 text-center space-y-2 sm:space-y-3">
          <p className="flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold">
            <UserRound size={20} /> {user?.name || "Guest User"}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <Mail size={18} /> {user?.email || "guest@example.com"}
          </p>
        </div>

        {/* Divider */}
        <div className="w-2/3 border-b border-gray-300 dark:border-gray-700 my-6"></div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white py-2.5 px-8 rounded-xl shadow-md hover:shadow-blue-400/40 transition-all duration-300">
            Edit Profile
          </button>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white py-2.5 px-8 rounded-xl shadow-md hover:shadow-red-400/40 transition-all duration-300"
           onClick={logoutHandle}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
