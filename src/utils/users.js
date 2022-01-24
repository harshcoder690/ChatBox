const users = []

const adduser = ({ id, username, room }) => {
    //making changes to username and room
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //check if credentials were correct or not
    if (!username || !room) {
        return {
            error: 'Username and room is required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //return error if user is present
    if (existingUser) {
        return {
            error: "user is present"
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user);
    return { user }

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    getUser,
    removeUser,
    getUsersInRoom,
    adduser
}