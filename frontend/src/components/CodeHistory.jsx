import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { setHistory, setLoading, setError } from "../redux/slices/codeHistorySlice";
import { setCode } from "../redux/slices/editorSlice";
import socket from "../socket/socket";
import { Clock, RotateCcw } from "lucide-react";

const CodeHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { history, loading, error } = useSelector((state) => state.codeHistory);
    const { room } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.auth);
    const participants = useSelector((state) => state.room.participants);

    const roomId = room?.roomId;
    const isOwner = participants?.find((p) => p.user._id === user?._id)?.role === "owner";

    useEffect(() => {
        const fetchHistory = async () => {
            if (!roomId) return;

            dispatch(setLoading(true));
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/history/code-history/${roomId}`,
                    { withCredentials: true }
                );
                dispatch(setHistory(res.data.codeVersions));
            } catch (err) {
                console.error("Error fetching history:", err);
                dispatch(setError(err.response?.data?.message || "Failed to fetch history"));
                toast.error("Failed to load history");
            }
        };

        fetchHistory();
    }, [roomId, dispatch]);

    const handleRestore = (versionCode) => {
        if (!isOwner) {
            toast.error("Only the owner can restore code");
            return;
        }

        // Update Redux state
        dispatch(setCode(versionCode));

        // Emit socket event to update other users
        socket.emit("code-change", { roomId, code: versionCode });

        toast.success("Code restored successfully");
        navigate("/dashboard/codeEditor");
    };

    if (!roomId) {
        return <div className="p-4 text-center">Please join a room first.</div>;
    }

    if (loading) {
        return <div className="p-4 text-center">Loading history...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    console.log("history",history);
    

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" /> Code History
            </h2>

            <div className="space-y-4">
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center">No saved history found.</p>
                ) : (
                    history.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Saved on: {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                    <div className="mt-2 bg-gray-100 dark:bg-slate-900 p-2 rounded text-xs text-white font-mono overflow-x-auto max-h-32">
                                        <pre>{item.code.substring(0, 200)}...</pre>
                                        
                                    </div>
                                </div>

                                {isOwner && (
                                    <button
                                        onClick={() => handleRestore(item.code)}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                    >
                                        <RotateCcw size={16} /> Restore
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CodeHistory;
