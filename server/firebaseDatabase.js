const database = require('./firebaseConfig');

// Function to add a user to the Firebase Realtime Database
const addUser = async ({ id, name, username, room }) => {
  try {
    const snapshot = await database.ref(`rooms/${room}`).orderByChild('username').equalTo(username).once('value');

    const userData = snapshot.val();

    if (userData && Object.keys(userData).length > 0) {
      const userDataId = Object.keys(userData)[0];
      const userRef = database.ref(`rooms/${room}/${userDataId}`);
      await userRef.update({ id });
    } else {
      const userRef = database.ref(`rooms/${room}`);
      const newUserRef = userRef.push();
      await newUserRef.set({ id, name, username, room });
    }

    return { user: { id, name, username, room } };
  } catch (error) {
    console.error('Error adding user to the database:', error);
    return { error: 'Internal server error' };
  }
};

// Function to remove a user from the Firebase Realtime Database
const removeUser = async (id, room) => {
  try {
    const userRef = database.ref(`rooms/${room}`);
    const snapshot = await userRef.orderByChild('id').equalTo(id).once('value');
    const userData = snapshot.val();

    if (userData) {
      const userKey = Object.keys(userData)[0];

      await userRef.child(userKey).remove();

      return userData[userKey];
    }
  } catch (error) {
    console.error('Error removing user from the database:', error);
  }
};

// Function to get a user from the Firebase Realtime Database
const getUser = async (id) => {
  try {
    const snapshot = await database.ref('rooms').once('value');
    const userData = snapshot.val();

    if (userData) {
      const user = Object.values(userData)
        .flatMap(roomData => Object.values(roomData))
        .find(user => user.id === id);

      if (user) {
        return user;
      }
    }
  } catch (error) {
    console.error('Error getting user by ID from the database:', error);
  }
};


// Function to get users of a room from the Firebase Realtime Database
const getUsersOfRoom = async (room) => {
  try {
    const snapshot = await database.ref(`rooms/${room}`).once('value');
    const userData = snapshot.val();

    if (userData) {
      return Object.values(userData);
    }

    return null;
  } catch (error) {
    console.error('Error getting users of room from the database:', error);
  }
};

const saveMessage = async ({ sender, content, timestamp }, room) => {
  const messagesRef = database.ref(`messages/${room}`);
  const snapshot = await messagesRef.once('value');
  const messages = snapshot.val() || {};

  let messageId = Object.keys(messages).length;

  await messagesRef.child(messageId).set({ sender, content, timestamp });
};

module.exports = { addUser, removeUser, getUser, getUsersOfRoom, saveMessage };
