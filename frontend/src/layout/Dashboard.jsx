
import React, { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Handshake,
  SquarePlus,
  Users,
  Codesandbox,
  Video,
  UserPen,
  History,
} from "lucide-react";
import useFetchRoomDetails from "../hooks/useFetchRoomDetails.js";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearRoom, removeParticipant } from "../redux/slices/roomSlice";

const Dashboard = () => {
  const fetchRoomDetails = useFetchRoomDetails();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchRoomDetails();

    socket.on("room-updated", () => {
      fetchRoomDetails();
    });

    socket.on("user-joined", ({ name }) => {
      toast.success(`${name} joined the room`);
    });

    socket.on("user-left", ({ name }) => {
      toast(`${name} left the room`, { icon: "👋" });
    });

    socket.on("participant-kicked", (participantId) => {
      if (participantId === user?._id) {
        toast.error("You have been kicked from the room!");
        dispatch(clearRoom());
        navigate("/dashboard");
      } else {
        dispatch(removeParticipant(participantId));
      }
    });

    return () => {
      socket.off("room-updated");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("participant-kicked");
    };
  }, [user, dispatch, navigate]);

  return (
    <div className="min-h-screen relative">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="h-[90vh] overflow-auto">
          {/* 👇 This is where the current route will render */}
          <Outlet />
        </div>

        <nav className="w-full h-[10vh] fixed bottom-0 px-2 rounded-t-xl bg-white shadow-md">
          <ul className="h-full flex items-center justify-around">
            <NavLink
              to="joinRoom"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <Handshake size={40} />
            </NavLink>

            <NavLink
              to="createRoom"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <SquarePlus size={40} />
            </NavLink>

            <NavLink
              to="participants"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <Users size={40} />
            </NavLink>

            <NavLink
              to="codeEditor"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <Codesandbox size={40} />
            </NavLink>

            <NavLink
              to="history"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <History size={40} />
            </NavLink>

            <NavLink
              to="videoRoom"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <Video size={40} />
            </NavLink>

            <NavLink
              to="profile"
              className={({ isActive }) =>
                `p-2 ${isActive
                  ? "text-blue-400 bg-blue-100 rounded-xl transform -translate-y-3 transition-all duration-300"
                  : "text-gray-500"
                }`
              }
            >
              <UserPen size={40} />
            </NavLink>
          </ul>
        </nav>
      </div>

      {/* Desktop view can be added below if needed */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col justify-between dark:bg-black">
          <div>
            <div className="p-5 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Dashboard</h1>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              <NavLink
                to="joinRoom"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <Handshake size={20} /> Join Room
              </NavLink>

              <NavLink
                to="createRoom"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <SquarePlus size={20} /> Create Room
              </NavLink>

              <NavLink
                to="participants"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <Users size={20} /> Participants
              </NavLink>

              <NavLink
                to="codeEditor"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <Codesandbox size={20} /> Code Editor
              </NavLink>

              <NavLink
                to="videoRoom"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <Video size={20} /> Video Room
              </NavLink>

              <NavLink
                to="history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <History size={20} /> History
              </NavLink>

              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-700"
                  }`
                }
              >
                <UserPen size={20} /> Profile
              </NavLink>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
            © {new Date().getFullYear()} MentorSphere
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
