import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import cors from "cors";
import twilio from "twilio";
import { Server } from "socket.io";
config();
// Initialize app ;
const app = express();

// enabling cors;
app.use(cors());

let connectedUser = [];
let rooms = [];

app.get("/api/room-exists/:roomId", (req, res) => {
  const { roomId } = req.params;

  const room = rooms.find((room) => room.id === roomId);

  // checking if  room exists or not

  if (room) {
    // if the connected user greater than 3
    if (connectedUser.length > 3) {
      return res.status(200).json({
        roomExist: true,
        full: true,
      });
    } else {
      // if the roomExist and not full
      return res.status(200).json({
        roomExist: true,
        full: false,
      });
    }
  } else {
    // room not exist and not full either
    return res.status(200).json({
      roomExist: false,
    });
  }
});

// create http server;
const server = http.createServer(app);

// Create a Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin, you can specify your domain here
    methods: ["GET", "POST"], // Allow only specified methods
  },
});

// assigning port
const PORT = process.env.PORT || 8080;
// server listen to port
server.listen(PORT, () => console.log(`port connected localhost:${PORT}`));
