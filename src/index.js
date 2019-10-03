
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
// static middleware express function to serve the public folders 
app.use(express.static(publicPath));


// listen for every message from client side. pass socket as argument to be able to listen for any individual message 
io.on('connection', (socket) => {
    // add bad-word packege filter
    const filter = new Filter()
    console.log('Welcome from soket');

    //set listner for room
    socket.on('join', ({ username, room }, callback) => {
        // call addUser here to get all the data about user such as id from socket.id, username and room he has signed up with 
        const { error, user } = addUser({ id: socket.id, username, room })

        //check if errore exists then call callback with the errore
        if (error) {
            return callback(error)
        }
        // call socket.join() in order to be able to join a specific chat room - defined when user join the chat  
        socket.join(user.room);

        // emit welcome message
        socket.emit('message', generateMessage('Admin', 'Welcome to the Chat'));
        // emit general broadcast message
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the ${user.room}`));
        // update users list in chat room when someone joins
        socket.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
    });

    // enable server to listen for mesages from user
    socket.on('chatUser', (message, callback) => {
        const user = getUser(socket.id);
        // set words filter
        filter.addWords('pula', 'ma-ta', 'mata', 'sugi', 'cazzo')
        if (filter.isProfane(message)) {
            return callback('Bad language isn\'t admited!')
        };

        // emit single message from specific user
        io.to(user.room).emit('singleMessage', generateMessage(user.username, message));
        callback()
    });

    // send message disconnect to everyone
    socket.on('disconnect', () => {
        // call removeUser to delete a user form chat room 
        const user = removeUser(socket.id);
        if (user) {
            // emit the message user has left the chat room 
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat!`));
            // update users in chat room when someone leaves
            socket.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            });
        }
    });

    // enable user geolocation emit to everyone
    socket.on('location', (position, callback) => {
        // call getUser to fetch the ser here and the room he has signed up to 
        const user = getUser(socket.id);
        // emit user location 
        io.to(user.room).emit('userLocation', generateLocation(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    });
});

// turn on server
server.listen(port, () => {
    console.log(' Sever is up and runnning on port: ' + port)
});

