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
