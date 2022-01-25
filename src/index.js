const express = require('express');
const http = require('http');
const socket = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { adduser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socket(server);
app.use(express.static("public"))
const port = process.env.PORT || 3000

io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = adduser({ id: socket.id, username, room })

        if (error) {
            return callback(error);
        }
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} have joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            callback('BAD-WORDS WERE NOT ALLOWED')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })
    socket.on('location', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})