import { Socket } from "node:dgram";
import app from "./app/app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpserver = createServer(app);

// socket io server
const io = new Server(httpserver);
// In Socket.IO, "connect" is a built-in event name for when a client connects

// omly one event is on the io and the rest are on socket

// io=>whole server
// socket=>single user

io.on("connect", (socket) => {
  console.log("User connected");

  //   socket.id is for every connection of user not every user but for its connection
  console.log(socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpserver.listen(3000, (req, res) => {
  console.log("Server is running on 3000 port ");
});

// Initially the socket io starts the communication from long polling by default , and only if the users browser and the server is compatable for websocket, then it switches to websocket protocol

// long polling is done via the http protocol,soby default the socket io requires the http server

// app is a funtion,its a express app,not a http server,it creates a http server internally but wont expose the http server so we need to create http server first

// to craete a http server

// import { createServer } from "node:http";
// const httpserver = createServer(app);
// httpserver.listen ->start the server

// now any req on the server is redirected to the express app and its handled by it,but for the communication to happen we nedd the http server thats why we created it , and the express is required for the middlewares so its needed
