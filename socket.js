const socketIO = require("socket.io");
const User = require("./models/user");
const mongoose = require("mongoose");

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: [
        "https://user-manager-front-ebon.vercel.app",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    },
  });

  let topRankUserId = null; 

  io.on("connection", (socket) => {
    console.log("New client connected");

    const userId = socket.handshake.query.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid or missing userId on connection:", userId);
      socket.disconnect();
      return;
    }

    // Set user status to active when they connect
    const setActiveStatus = async () => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { isActive: true },
          { new: true }
        );
        if (user) {
          io.emit("updateUserStatus", { userId: user._id, isActive: true });
        }
      } catch (err) {
        console.error("Error updating user status:", err);
      }
    };

    setActiveStatus();

    // Get initial leaderboard and emit to client
    socket.on("getRank", async () => {
      try {
        const rankData = await User.find({ role: { $ne: "admin" } })
          .sort({ bananaClickCount: -1 })
          .select("username bananaClickCount");
        socket.emit("updateRank", rankData);
      } catch (err) {
        console.error("Error fetching rank data:", err);
      }
    });

    // Handle player click and update rank
    socket.on("playerClick", async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (user.isBlocked) {
            socket.emit("userBlocked");
            return;
          }

          // Increase the banana click count and update the user
          user.bananaClickCount += 1;
          await user.save();

          const updatedRankData = await User.find({ role: { $ne: "admin" } })
            .sort({ bananaClickCount: -1 })
            .select("username bananaClickCount isActive isBlocked");

          io.emit("updateRank", updatedRankData);

          const newTopRankUser = updatedRankData[0]; 
          if (newTopRankUser._id.toString() !== topRankUserId) {
            topRankUserId = newTopRankUser._id.toString();
            io.to(socket.id).emit("topRankReached"); 
          }
        }
      } catch (err) {
        console.error("Error processing player click:", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error("Invalid userId on disconnect:", userId);
          return;
        }

        const user = await User.findById(userId);
        if (user) {
          await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
          );
          io.emit("updateUserStatus", { userId: user._id, isActive: false });
        }
      } catch (err) {
        console.error("Error updating user status on disconnect:", err);
      }
      console.log("Client disconnected");
    });
  });
};

module.exports = initSocket;
