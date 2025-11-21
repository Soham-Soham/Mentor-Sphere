import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import SimplePeer from "simple-peer";
import socket from "../socket/socket";
import { Video, Mic, MicOff, VideoOff, User } from "lucide-react";

const VideoRoom = () => {
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const userVideo = useRef();
    const peersRef = useRef([]);
    const { room } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.auth);
    const roomId = room?.roomId;

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }

                socket.emit("join-video-room", {
                    roomId,
                    userId: user._id,
                    name: user.name,
                    avatar: user.avatar
                });

                socket.on("user-joined", ({ socketId, name, avatar }) => {
                    const peer = createPeer(socketId, socket.id, currentStream);
                    const peerObj = {
                        peerID: socketId,
                        peer,
                        name,
                        avatar,
                        isAudioMuted: false,
                        isVideoMuted: false
                    };
                    peersRef.current.push(peerObj);
                    setPeers((users) => [...users, peerObj]);
                });

                socket.on("offer", ({ offer, from, name, avatar }) => {
                    const peer = addPeer(offer, from, currentStream);
                    const peerObj = {
                        peerID: from,
                        peer,
                        name,
                        avatar,
                        isAudioMuted: false,
                        isVideoMuted: false
                    };
                    peersRef.current.push(peerObj);
                    setPeers((users) => [...users, peerObj]);
                });

                socket.on("answer", ({ answer, from }) => {
                    const item = peersRef.current.find((p) => p.peerID === from);
                    if (item) {
                        item.peer.signal(answer);
                    }
                });

                socket.on("ice-candidate", ({ candidate, from }) => {
                    const item = peersRef.current.find((p) => p.peerID === from);
                    if (item) {
                        item.peer.signal(candidate);
                    }
                });

                socket.on("user-toggled-audio", ({ socketId, isMuted }) => {
                    const updatedPeers = peersRef.current.map(p => {
                        if (p.peerID === socketId) return { ...p, isAudioMuted: isMuted };
                        return p;
                    });
                    peersRef.current = updatedPeers;
                    setPeers(updatedPeers);
                });

                socket.on("user-toggled-video", ({ socketId, isVideoMuted }) => {
                    const updatedPeers = peersRef.current.map(p => {
                        if (p.peerID === socketId) return { ...p, isVideoMuted: isVideoMuted };
                        return p;
                    });
                    peersRef.current = updatedPeers;
                    setPeers(updatedPeers);
                });

                socket.on("user-left", ({ socketId }) => {
                    const peerObj = peersRef.current.find((p) => p.peerID === socketId);
                    if (peerObj) {
                        peerObj.peer.destroy();
                    }
                    const newPeers = peersRef.current.filter((p) => p.peerID !== socketId);
                    peersRef.current = newPeers;
                    setPeers(newPeers);
                });



            })
            .catch((err) => {
                console.error("Error accessing media devices:", err);
            });

        return () => {
            socket.off("user-joined");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("user-left");
            socket.off("user-toggled-audio");
            socket.off("user-toggled-video");
            // Clean up stream and peers
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            peersRef.current.forEach(p => p.peer.destroy());
        };
    }, [roomId, user._id]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", (signal) => {
            if (signal.type === 'offer') {
                socket.emit("offer", {
                    offer: signal,
                    to: userToSignal,
                    from: callerID,
                    roomId,
                    name: user.name,
                    avatar: user.avatar
                });
            } else if (signal.candidate) {
                socket.emit("ice-candidate", { candidate: signal, to: userToSignal, from: callerID, roomId });
            }
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", (signal) => {
            if (signal.type === 'answer') {
                socket.emit("answer", { answer: signal, to: callerID, from: socket.id, roomId });
            } else if (signal.candidate) {
                socket.emit("ice-candidate", { candidate: signal, to: callerID, from: socket.id, roomId });
            }
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const toggleAudio = () => {
        if (stream) {
            const enabled = !stream.getAudioTracks()[0].enabled;
            stream.getAudioTracks()[0].enabled = enabled;
            setIsAudioMuted(!enabled);
            socket.emit("toggle-audio", { roomId, isMuted: !enabled });
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const enabled = !stream.getVideoTracks()[0].enabled;
            stream.getVideoTracks()[0].enabled = enabled;
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
                            ref={userVideo}
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
                {peers.map((peerObj) => (
                    <VideoPlayer key={peerObj.peerID} peerObj={peerObj} />
                ))}
            </div>
        </div>
    );
};

const VideoPlayer = ({ peerObj }) => {
    const ref = useRef();
    const { peer, name, avatar, isVideoMuted, isAudioMuted } = peerObj;

    useEffect(() => {
        peer.on("stream", (stream) => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg border border-gray-700">
            {!isVideoMuted ? (
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
                    <p className="font-semibold">{name}</p>
                </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                {name}
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
