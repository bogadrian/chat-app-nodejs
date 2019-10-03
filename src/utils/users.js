const users = [];

const addUser = ({ id, username, room }) => {
    //sanitize the inputs
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if (!username || !room) {
        return {
            error: 'A username and a room must be provided!'
        }
    };

    //check if user exits
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if (existingUser) {
        return {
            error: 'The user name is already in use! Please provide a diffrent one'
        }
    };

    const user = { id, username, room }
    users.push(user)
    return { user }
};

const removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }


};

const getUser = (id) => {
    const user = users.find(one => {
        return one.id === id;
    });
    return user;
};

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    const userInRoom = users.filter(one => {
        return one.room === room;
    });
    return userInRoom
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}