const users = [];

// add user function
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
        //if room or user allready existingUser, return it and store it in existingUser
        return user.room === room && user.username === username;
    });
    //if user exits retun an errore
    if (existingUser) {
        return {
            error: 'The user name is already in use! Please provide a diffrent one'
        }
    };

    // put all the object proprieties in user variable and then push the user in users array. retun that user
    const user = { id, username, room }
    users.push(user)
    return { user }
};
// remove user by id provided
const removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }


};
// get user by id provided
const getUser = (id) => {
    const user = users.find(one => {
        return one.id === id;
    });
    return user;
};
// get user in room by room provided
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