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
  console.log(roomId)
  const room = rooms.find((room) => room.id === roomId);
  console.log(room)
  console.log(connectedUser)
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

// whenever a new connection is formed ;
//we are going to get socket inside the call back
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);

  // listening to create-room handler;
  socket.on("create-room", (data) => {
    //handler function for create room;
    createRoomHandler(data, socket);
  });



  socket.on("join-room", (data) => {
    // handler function for join room;
    joinRoomHandler(data, socket);
  });
});

// create room handler function;
const createRoomHandler = (data, socket) => {
  // destruct the identity from the data object;
  const { identity } = data;

  // creating the room id;
  const roomId = uuidv4();

  // creating new user object;
  const newUser = {
    id: uuidv4(),
    identity,
    socketId: socket.id,
    roomId,
  };
  // push the new user to the connected user in an array;
  connectedUser = [...connectedUser, newUser];

  // create a room;
  const newRoom = {
    id: roomId,
    connectedUser: [newUser],
  };
  rooms = [...rooms, newRoom];

  //join room
  //join a socket channel with roomID (this will enable us to send updates to all participants in a room to send any event later on in one go)
  socket.join(roomId);

  // emitting event to the client with the roomId;
  socket.emit("room-id", { roomId });

  // sending an event to the client ;
  socket.emit("room-update", { connectedUser: newRoom.connectedUser });
};

const joinRoomHandler = (data, socket) => {
  const { identity, roomId } = data;

  // creating new user object;
  const newUser = {
    id: uuidv4(),
    identity,
    socketId: socket.id,
    roomId,
  };
  const findRoom = rooms.find((room) => room.id === roomId);

  findRoom.connectedUser = [...findRoom.connectedUser, newUser];

  // join room;
  socket.join(roomId);

  connectedUser = [...connectedUser, newUser];

  // sent to all the clients who is in this particular room
  io.to(roomId).emit("room-update", { connectedUser: findRoom.connectedUser });
};

// assigning port
const PORT = process.env.PORT || 8080;
// server listen to port
server.listen(PORT, () => console.log(`port connected localhost:${PORT}`));
