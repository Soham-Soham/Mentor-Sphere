
export const socketManager = (io) => {
  io.on("connection", (socket) => {
    // console.log(" New user connected: ", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      // console.log(`User ${socket.id} joined code room ${roomId}`);
      io.to(roomId).emit("room-updated");
    });

    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("input-change", ({ roomId, input }) => {
      socket.to(roomId).emit("input-update", input);
    });

    socket.on("output-change", ({ roomId, output }) => {
      socket.to(roomId).emit("output-update", output);
    });

    socket.on("language-change", ({ roomId, language }) => {
      socket.to(roomId).emit("language-update", language);
    });

    //--------------------------------------
    //--------WebRTC-signaling--------------
    //--------------------------------------

    socket.on("join-video-room", ({ roomId, userId, name, avatar }) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined video room ${roomId}`);
      socket.to(roomId).emit("user-joined", {
        userId,
        socketId: socket.id,
        name,
        avatar
      });
    });

    // Handle offer
    socket.on("offer", ({ roomId, offer, from, to, name, avatar }) => {
      io.to(to).emit("offer", { offer, from, name, avatar });
    });

    // Handle answer
    socket.on("answer", ({ roomId, answer, from, to }) => {
      io.to(to).emit("answer", { answer, from });
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ roomId, candidate, from, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from });
    });

    // Handle media toggles
    socket.on("toggle-audio", ({ roomId, isMuted }) => {
      socket.to(roomId).emit("user-toggled-audio", { socketId: socket.id, isMuted });
    });

    socket.on("toggle-video", ({ roomId, isVideoMuted }) => {
      socket.to(roomId).emit("user-toggled-video", { socketId: socket.id, isVideoMuted });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // console.log("User disconnected: ", socket.id);
      socket.rooms.forEach((roomId) => {
        socket.to(roomId).emit("user-left", { socketId: socket.id });
      });
    });


  });
};
