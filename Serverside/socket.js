import { Server } from "socket.io";


export default function initSocket(server) {
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });  

  let users = [];

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join-board", ({ boardId, userId }) => {
      socket.join(boardId);
      socket.to(boardId).emit("presence", { userId, type: "join" });
    });

    socket.on("nodes:update", ({ boardId, nodes }) => {
      socket.to(boardId).emit("nodes:sync", nodes);
    });

    socket.on("cursor:move", ({ boardId, userId, x, y }) => {
      socket.to(boardId).emit("cursor:move", { userId, x, y });
    });

    socket.on("leave-board", ({ boardId, userId }) => {
      socket.leave(boardId);
      socket.to(boardId).emit("presence", { userId, type: "leave" });
    });

    socket.on("join", (username) =>{
    if(!users.some((user) => user.id === socket.id)){
      users.push({id: socket.id, username})
    }

    io.emit(
      "user", 
      users.map(user => user.username)
    );

    io.emit("message", {
      username: "System",
      message: `${username} has joined the chat.`
    });
  })

  socket.on("typing", (data) => {
  socket.broadcast.emit("typing", data);
});

  socket.on("message", (data) => {
  io.emit("message", data);
});

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}






  
