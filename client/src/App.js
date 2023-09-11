import { useState, useEffect } from "react";
import socketIO from "socket.io-client";
const socket = socketIO.connect("http://localhost:4000", {
    autoConnect: false,
});

function App() {
    const [messagesReceived, setMessagesReceived] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [room, setRoom] = useState("");
    const users = ["Sean", "Dave"];

    const handleJoin = (e) => {
        socket.auth = { username: "Sean" };
        socket.connect();

        const roomName = e.target.name;
        setRoom(roomName);
        socket.emit("joinRoom", { username: "Sean", room: roomName });

        // // Get room and users
        // socket.on("roomUsers", ({ room, users }) => {
        //     outputRoomName(room);
        //     outputUsers(users);
        // });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (messageText) {
            socket.emit("chatMessage", messageText);
            setMessageText("");
        }
    };

    useEffect(() => {
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });
        socket.on("message", (data) => {
            console.log(data);
            setMessagesReceived((state) => [
                ...state,
                {
                    message: data.message,
                    username: data.username,
                    room: data.room,
                    time: data.time,
                },
            ]);
        });

        // Remove event listener on component unmount
        return () => socket.off("message");
    }, [socket]);

    return (
        <div>
            <p>Hello World!</p>
            <button onClick={handleJoin} name="room1">
                Join 1
            </button>
            <button onClick={handleJoin} name="room2">
                Join 2
            </button>
            <button onClick={handleJoin} name="room3">
                Join 3
            </button>
            <button onClick={handleSend}>Send</button>
            <div>
                <h1>Chat with: {room}</h1>
                {messagesReceived.map((message, i) => {
                    // if (message.room === room)
                    return (
                        <h1 key={i}>
                            {message.username}: <small>{message.message}</small>
                        </h1>
                    );
                })}
            </div>
            <form onSubmit={handleSend}>
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    autoComplete="off"
                />
                <input type="submit" value="Send" />
            </form>
        </div>
    );
}

export default App;
