import React, { useEffect, useRef, useState } from "react";
import socket from "../socket/socket"; // your socket.io-client instance
import { Video, Mic, MicOff, VideoOff, User } from "lucide-react";
import { useSelector } from "react-redux";


const TURN_CONFIG = [
    { urls: "stun:stun.l.google.com:19302" }
];


const VideoRoom = () => {
    const [peers, setPeers] = useState({}); // { socketId: { stream, name, avatar, isAudioMuted, isVideoMuted } }
    const [localStream, setLocalStream] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const localVideoRef = useRef(null);
    const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
    const localTracksRef = useRef({ audio: null, video: null });

    const { room } = useSelector((s) => s.room);
    const { user } = useSelector((s) => s.auth);
    const roomId = room?.roomId;

    useEffect(() => {
        if (!roomId || !user) return;

        let mounted = true;

        // --- SIGNALING HANDLERS ---
        // Define these BEFORE emitting join-video-room to avoid race conditions

        const handleUserJoined = async ({ socketId, name, avatar }) => {
            console.log("user-joined:", socketId, name);
            // create UI placeholder
            setPeers((p) => ({
                ...p,
                [socketId]: { stream: null, name, avatar, isAudioMuted: false, isVideoMuted: false },
            }));

            // create pc and attach tracks (tracks must be added BEFORE negotiation)
            const pc = createPeerConnection(socketId);
            // add local tracks
            if (localStream) {
                addLocalTracksToPc(pc, localStream);
            } else if (localTracksRef.current.audio || localTracksRef.current.video) {
                // Fallback if localStream state isn't set but tracks exist
                // This might happen if stream setup is racing with join
                // But usually we wait for getUserMedia before joining.
                // See logic below.
            }

            peerConnections.current[socketId] = pc;

            // Manual Offer Creation (Caller Side)
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("offer", {
                    roomId,
                    offer,
                    from: socket.id,
                    to: socketId,
                    name: user.name,
                    avatar: user.avatar
                });
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        };

        const handleOffer = async ({ offer, from, name, avatar }) => {
            console.log("Received offer from", from, name);
            setPeers((p) => ({
                ...p,
                [from]: { stream: null, name: name || "User", avatar, isAudioMuted: false, isVideoMuted: false },
            }));

            const pc = createPeerConnection(from);
            peerConnections.current[from] = pc;

            // add local tracks before answering
            if (localStream) {
                addLocalTracksToPc(pc, localStream);
            }

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("answer", { roomId, answer, from: socket.id, to: from });
            } catch (err) {
                console.error("Error handling offer:", err);
            }
        };

        const handleAnswer = async ({ answer, from }) => {
            console.log("Received answer from:", from);
            const pc = peerConnections.current[from];
            if (!pc) return console.warn("No pc for", from);
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
                console.error("Error setting remote description (answer):", err);
            }
        };

        const handleIceCandidate = async ({ candidate, from }) => {
            const pc = peerConnections.current[from];
            if (pc && candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        const handleUserLeft = ({ socketId }) => {
            console.log("user-left", socketId);
            if (peerConnections.current[socketId]) {
                peerConnections.current[socketId].close();
                delete peerConnections.current[socketId];
            }
            setPeers((prev) => {
                const copy = { ...prev };
                delete copy[socketId];
                return copy;
            });
        };

        const handleToggleAudio = ({ socketId, isMuted }) => {
            setPeers((p) => ({ ...p, [socketId]: { ...p[socketId], isAudioMuted: isMuted } }));
        };

        const handleToggleVideo = ({ socketId, isVideoMuted }) => {
            setPeers((p) => ({ ...p, [socketId]: { ...p[socketId], isVideoMuted } }));
        };


        // Register listeners
        socket.on("user-joined", handleUserJoined);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleIceCandidate);
        socket.on("user-left", handleUserLeft);
        socket.on("user-toggled-audio", handleToggleAudio);
        socket.on("user-toggled-video", handleToggleVideo);

        socket.on("existing-users", (users) => {
            console.log("Existing users:", users);

            users.forEach((socketId) => {
                const pc = createPeerConnection(socketId);
                peerConnections.current[socketId] = pc;

                if (localStream) addLocalTracksToPc(pc, localStream);

                pc.createOffer()
                    .then((offer) => {
                        pc.setLocalDescription(offer);
                        socket.emit("offer", {
                            roomId,
                            offer,
                            from: socket.id,
                            to: socketId,
                            name: user.name,
                            avatar: user.avatar
                        });
                    });
            });
        });



        // Get User Media THEN join
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                if (!mounted) return;
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // keep track of local tracks to add to every peer connection
                const audioTrack = stream.getAudioTracks()[0] || null;
                const videoTrack = stream.getVideoTracks()[0] || null;
                localTracksRef.current = { audio: audioTrack, video: videoTrack };

                // Join room (tell server we're here) AFTER listeners are ready
                console.log("Joining video room...", roomId);
                socket.emit("join-video-room", {
                    roomId,
                    userId: user._id,
                    name: user.name,
                    avatar: user.avatar,
                });
            })
            .catch((err) => {
                console.error("getUserMedia error:", err);
            });

        // cleanup
        return () => {
            mounted = false;
            socket.off("user-joined", handleUserJoined);
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIceCandidate);
            socket.off("user-left", handleUserLeft);
            socket.off("user-toggled-audio", handleToggleAudio);
            socket.off("user-toggled-video", handleToggleVideo);

            // close peer connections
            Object.values(peerConnections.current).forEach((pc) => pc.close());
            peerConnections.current = {};

            if (localStream) {
                localStream.getTracks().forEach((t) => t.stop());
            }
            // Also stop tracks in ref if different (unlikely but good practice)
            if (localTracksRef.current.audio) localTracksRef.current.audio.stop();
            if (localTracksRef.current.video) localTracksRef.current.video.stop();
        };
    }, [roomId, user?._id]); // Dependencies

    // helper: create RTCPeerConnection and event handlers
    const createPeerConnection = (remoteSocketId) => {
        const pc = new RTCPeerConnection({ iceServers: TURN_CONFIG });

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
            console.log("ontrack from", remoteSocketId, event.streams);
            const remoteStream = event.streams[0];
            setPeers((prev) => ({
                ...prev,
                [remoteSocketId]: { ...prev[remoteSocketId], stream: remoteStream },
            }));
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state for", remoteSocketId, pc.connectionState);
            if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
                // attempt cleanup
                pc.close();
                delete peerConnections.current[remoteSocketId];
                setPeers((prev) => {
                    const copy = { ...prev };
                    delete copy[remoteSocketId];
                    return copy;
                });
            }
        };

        return pc;
    };

    // add local tracks to an RTCPeerConnection (idempotent-ish)
    const addLocalTracksToPc = (pc, stream) => {
        if (!pc) return;
        // prefer using stored tracks (same track objects)
        const { audio, video } = localTracksRef.current;
        // If stream is passed, use its tracks if ref is empty (first load)
        const audioTrack = audio || stream.getAudioTracks()[0];
        const videoTrack = video || stream.getVideoTracks()[0];

        if (audioTrack) {
            // Check if track already added
            const senders = pc.getSenders();
            const alreadyHasAudio = senders.some(s => s.track?.kind === 'audio');
            if (!alreadyHasAudio) pc.addTrack(audioTrack, stream);
        }
        if (videoTrack) {
            const senders = pc.getSenders();
            const alreadyHasVideo = senders.some(s => s.track?.kind === 'video');
            if (!alreadyHasVideo) pc.addTrack(videoTrack, stream);
        }
    };

    const toggleAudio = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (!audioTrack) return;
        audioTrack.enabled = !audioTrack.enabled;
        const muted = !audioTrack.enabled;
        setIsAudioMuted(muted);
        socket.emit("toggle-audio", { roomId, isMuted: muted });
    };

    const toggleVideo = () => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (!videoTrack) return;
        videoTrack.enabled = !videoTrack.enabled;
        const disabled = !videoTrack.enabled;
        setIsVideoMuted(disabled);
        socket.emit("toggle-video", { roomId, isVideoMuted: disabled });
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-6 h-6" /> Video Room
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto">
                {/* Local */}
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
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mb-2" />
                            ) : (
                                <User size={64} className="mb-2" />
                            )}
                            <p className="font-semibold">{user?.name} (You)</p>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">You</div>
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button onClick={toggleAudio} className={`p-2 rounded-full ${isAudioMuted ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"}`}>
                            {isAudioMuted ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
                        </button>
                        <button onClick={toggleVideo} className={`p-2 rounded-full ${isVideoMuted ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"}`}>
                            {isVideoMuted ? <VideoOff size={16} className="text-white" /> : <Video size={16} className="text-white" />}
                        </button>
                    </div>
                </div>

                {/* Remote peers */}
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
            // Explicitly play to avoid autoplay policy issues or stalled playback
            ref.current.play().catch(e => console.error("Error playing video:", e));
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
                    {avatar ? <img src={avatar} alt={name} className="w-20 h-20 rounded-full mb-2" /> : <User size={64} className="mb-2" />}
                    <p className="font-semibold">{name || "Connecting..."}</p>
                </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">{name || "User"}</div>

            {isAudioMuted && (
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded-full">
                    <MicOff size={14} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default VideoRoom;
