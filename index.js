const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const botName = "Chat Bot";

// io.use((socket, next) => {
//     const username = socket.handshake.auth.username;
//     if (!username) {
//         return next(new Error("invalid username"));
//     }
//     socket.username = username;
//     next();
// });

// Run when client connects
io.on("connection", (socket) => {
    // console.log(io.of("/").adapter);
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome current user
        socket
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, "Welcome to ChatCord!", user.room)
            );

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(
                    botName,
                    `${user.username} has joined the chat`,
                    user.room
                )
            );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit(
            "message",
            formatMessage(user.username, msg, user.room)
        );
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

server.listen(4000, () => "Server is running on port 3000");
