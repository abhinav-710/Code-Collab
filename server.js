const express = require('express')
const http = require('http')
const socketIO = require('socket.io');
const port = 5000;
let rooms = {}
let language
let value
const app = express()
const server = http.createServer(app)
// Create a socketIO server
const io = socketIO(server, {
    cors: {
        origin: "*",
    },
});
let username, roomname

io.on("connection", (socket) => {
    // const { id } = socket.client
    console.log(`User connected`, socket.id)

    socket.on('join-room', ({ name, room }) => {
        console.log(name, room);
        username = name
        roomname = room
        const present = room in rooms
        if (!present) {
            rooms[room] = {
                language: 'javascript',
                value: ''
            }
        }
        socket.join(room)
        // console.log(rooms)
        language = rooms[roomname].language
        value = rooms[roomname].value
        io.to(socket.id).emit('initial-language', language)
        io.to(socket.id).emit('initial-value', value)
    })

    socket.on('language-change', (data) => {
        // console.log(data);
        socket.broadcast.to(roomname).emit('language-change', data.language)
        language = data.language
        rooms[roomname].language = language
    })
    socket.on('value-change', (data) => {
        // console.log(data)
        socket.broadcast.to(roomname).emit('value-change', data.message)
        value = data.message
        rooms[roomname].value = value
        // console.log(rooms)
    })
    
});

server.listen(port, () => console.log(`Listening on port ${port}`))