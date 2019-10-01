
// load all the packeges needed
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users');

// initialize express app and create server with app 
const app = express();
const server = http.createServer(app)
// add socket.io to server
const io = socketio(server);
// define port 
const port = process.env.PORT || 3000;
// set public path to deliver public files 
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));


// listen for every message from client side. pass socket as argument to be able to listen for any individual message 
io.on('connection', (socket) => {
    // add bad-word packege filter
    const filter = new Filter()
    console.log('Welcome from soket');

    //set listner for room
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        // emit welcome message
        socket.emit('message', generateMessage('Welcome to the Chat'));
        // emit general broadcast message
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the ${user.room}`))
    });



    // enable server to listen for mesages from user
    socket.on('chatUser', (message, callback) => {
        // set words filter
        filter.addWords('pula', 'ma-ta', 'mata', 'sugi', 'cazzo')
        if (filter.isProfane(message)) {
            return callback('Bad language isn\'t admited!')
        };

        io.emit('singleMessage', generateMessage(message));
        callback()
    });

    // send ser disconnect message to everyone
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat!`))
        }
    });

    // enable user geolocation emit to everyone
    socket.on('location', (position, callback) => {
        io.emit('userLocation', generateLocation(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    });
});

// turn on server
server.listen(port, () => {
    console.log(' Sever is up and runnning on port: ' + port)
});

