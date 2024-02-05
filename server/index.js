const express = require("express");
const socketio = require("socket.io");
const http = require("http");
require('dotenv').config();

const { addUser, removeUser, getUser, getUsersOfRoom, saveMessage } = require("./firebaseDatabase");

const PORT = process.env.PORT || 8000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", async ({ name, username, room }, callback) => {
    const { error, user } = await addUser({
      id: socket.id,
      name: name,
      username: username,
      room: room,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", {
      sender: "admin",
      content: `${user.name}, welcome to the room ${user.room}`,
      timestamp: Date.now()
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { sender: "admin", content: `${user.name} has joined`, timestamp: Date.now() });

    const roomUsers = await getUsersOfRoom(user.room);
    io.to(user.room).emit("roomData", { room: user.room, users: roomUsers });

    callback(null, { success: true });
  });

  //user generated message are called 'sendMessage'
  socket.on("sendMessage", async (message, callback) => {
    const user = await getUser(socket.id);

    if (user) {
      const messageObj = {
        sender: user.username,
        content: message,
        timestamp: Date.now()
      }
      io.to(user.room).emit("message", messageObj);
      await saveMessage(messageObj, user.room);
      const roomUsers = await getUsersOfRoom(user.room);
      io.to(user.room).emit("roomData", { room: user.room, users: roomUsers });
    }

    callback();
  });

  socket.on("disconnect", async () => {
    const user = await removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        sender: "admin",
        content: `${user.name} has left.`,
        timestamp: Date.now()
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`);
});
