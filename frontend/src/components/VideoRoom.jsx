import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../socket/socket";
import { Video, Mic, MicOff, VideoOff, User } from "lucide-react";

const VideoRoom = () => {
    const [peers, setPeers] = useState({}); // { socketId: { stream, name, avatar, isAudioMuted, isVideoMuted } }
    const [localStream, setLocalStream] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const localVideoRef = useRef();
    const peerConnections = useRef({}); // { socketId: RTCPeerConnection }

    const { room } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.auth);
    const roomId = room?.roomId;

    useEffect(() => {
        // Get user media
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Join the room
                socket.emit("join-video-room", {
                    roomId,
                    userId: user._id,
                    name: user.name,
                    avatar: user.avatar
                });

                // --- Socket Event Listeners ---

                // 1. User Joined -> We (existing user) call them
                socket.on("user-joined", async ({ socketId, name, avatar }) => {
                    console.log("New user joined:", name, socketId);

                    // Initialize peer state for UI immediately (with no stream yet)
                    setPeers(prev => ({
                        ...prev,
                        [socketId]: { stream: null, name, avatar, isAudioMuted: false, isVideoMuted: false }
                    }));

                    const pc = createPeerConnection(socketId, stream);
                    peerConnections.current[socketId] = pc;

                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);

                        socket.emit("offer", {
                            roomId,
                            offer,
                            from: socket.id,
                            to: socketId,
                            name: user.name,   // Send our details
                            avatar: user.avatar
                        });
                    } catch (err) {
                        console.error("Error creating offer:", err);
                    }
                });

                // 2. Receive Offer -> We (new user) answer
                socket.on("offer", async ({ offer, from, name, avatar }) => {
                    console.log("Received offer from:", name, from);

                    // Initialize peer state
                    setPeers(prev => ({
                        ...prev,
                        [from]: { stream: null, name, avatar, isAudioMuted: false, isVideoMuted: false }
                    }));

                    const pc = createPeerConnection(from, stream);
                    peerConnections.current[from] = pc;

                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        socket.emit("answer", {
                            roomId,
                            answer,
                            from: socket.id,
                            to: from
                        });
                    } catch (err) {
                        console.error("Error handling offer:", err);
                    }
                });

                // 3. Receive Answer
                socket.on("answer", async ({ answer, from }) => {
                    const pc = peerConnections.current[from];
                    if (pc) {
                        try {
                            await pc.setRemoteDescription(new RTCSessionDescription(answer));
                        } catch (err) {
                            console.error("Error setting remote description (answer):", err);
                        }
                    }
                });

                // 4. ICE Candidates
                socket.on("ice-candidate", async ({ candidate, from }) => {
                    const pc = peerConnections.current[from];
                    if (pc && candidate) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (err) {
                            console.error("Error adding ICE candidate:", err);
                        }
                    }
                });

                // 5. User Left
                socket.on("user-left", ({ socketId }) => {
                    if (peerConnections.current[socketId]) {
                        peerConnections.current[socketId].close();
                        delete peerConnections.current[socketId];
                    }
                    setPeers(prev => {
                        const newPeers = { ...prev };
                        delete newPeers[socketId];
                        return newPeers;
                    });
                });

                // 6. Toggles
                socket.on("user-toggled-audio", ({ socketId, isMuted }) => {
                    setPeers(prev => ({
                        ...prev,
                        [socketId]: { ...prev[socketId], isAudioMuted: isMuted }
                    }));
                });

                socket.on("user-toggled-video", ({ socketId, isVideoMuted }) => {
                    setPeers(prev => ({
                        ...prev,
                        [socketId]: { ...prev[socketId], isVideoMuted: isVideoMuted }
                    }));
                });

            })
            .catch((err) => {
                console.error("Error accessing media devices:", err);
            });

        return () => {
            // Cleanup
            socket.off("user-joined");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("user-left");
            socket.off("user-toggled-audio");
            socket.off("user-toggled-video");

            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId, user._id]);

    const createPeerConnection = (remoteSocketId, stream) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    roomId,
                    candidate: event.candidate,
                    from: socket.id,
                    to: remoteSocketId,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track from:", remoteSocketId);
            setPeers(prev => ({
                ...prev,
                [remoteSocketId]: { ...prev[remoteSocketId], stream: event.streams[0] }
            }));
        };

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        return pc;
    };

    const toggleAudio = () => {
        if (localStream) {
            const enabled = !localStream.getAudioTracks()[0].enabled;
            localStream.getAudioTracks()[0].enabled = enabled;
            setIsAudioMuted(!enabled);
            socket.emit("toggle-audio", { roomId, isMuted: !enabled });
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const enabled = !localStream.getVideoTracks()[0].enabled;
            localStream.getVideoTracks()[0].enabled = enabled;
            setIsVideoMuted(!enabled);
            socket.emit("toggle-video", { roomId, isVideoMuted: !enabled });
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-6 h-6" /> Video Room
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto">
                {/* Local Video */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg border border-gray-700">
                    {!isVideoMuted ? (
                        <video
                            muted
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mb-2" />
                            ) : (
                                <User size={64} className="mb-2" />
                            )}
                            <p className="font-semibold">{user.name} (You)</p>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                        You
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                            onClick={toggleAudio}
                            className={`p-2 rounded-full ${isAudioMuted ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"}`}
                        >
                            {isAudioMuted ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`p-2 rounded-full ${isVideoMuted ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"}`}
                        >
                            {isVideoMuted ? <VideoOff size={16} className="text-white" /> : <Video size={16} className="text-white" />}
                        </button>
                    </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(peers).map(([id, peerObj]) => (
                    <VideoPlayer key={id} peerObj={peerObj} />
                ))}
            </div>
        </div>
    );
};

const VideoPlayer = ({ peerObj }) => {
    const ref = useRef();
    const { stream, name, avatar, isVideoMuted, isAudioMuted } = peerObj;

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg border border-gray-700">
            {!isVideoMuted && stream ? (
                <video
                    playsInline
                    autoPlay
                    ref={ref}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-20 h-20 rounded-full mb-2" />
                    ) : (
                        <User size={64} className="mb-2" />
                    )}
                    <p className="font-semibold">{name || "Connecting..."}</p>
                </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                {name || "User"}
            </div>

            {isAudioMuted && (
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded-full">
                    <MicOff size={14} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default VideoRoom;
