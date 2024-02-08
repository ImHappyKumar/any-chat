import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { getDatabase, ref, get } from "firebase/database";

import "./Chat.css";

import ScalingLoading from "../Loading/ScalingLoading";
import SpinnerLoading from "../Loading/SpinnerLoading";
import Menu from "../Menu/Menu";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";

import ScrollToBottom from "react-scroll-to-bottom";

let socket;

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const ENDPOINT = process.env.REACT_APP_ENDPOINT || "http://localhost:8000";

  // To join room
  useEffect(() => {
    const { name, username } = location.state.user;
    const room = location.state.room;

    socket = io(ENDPOINT);

    setName(name);
    setUsername(username);
    setRoom(room);

    socket.emit("join", { name, username, room }, (error) => {
      if (error) {
        alert(error);
      }
    });

    fetchMessages(room);

    return () => {
      socket.disconnect();
    };
  }, [location.state.user, location.state.room, ENDPOINT]);

  // To fetch room messages from database
  const fetchMessages = async (room) => {
    const db = getDatabase();
    const messagesRef = ref(db, `messages/${room}`);

    try {
      const snapshot = await get(messagesRef);
      const messageData = snapshot.val();

      if (messageData) {
        const messagesArray = Object.values(messageData);
        setMessages(messagesArray);
      }

      setMessageLoading(false);
    } catch (error) {
      alert("Internal Server Error");
      console.log(error);
      setMessageLoading(false);
    }
  };

  // To update messages array whenever a message is sent by admin or user
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
      setConnectionLoading(false);
    });
  }, [messages]);

  //function for sending messages
  const sendMessage = async (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  const leaveRoom = () => {
    socket.disconnect();
    if (socket.disconnected) {
      navigate("/");
    }
    else {
      console.error("Unable to disconnect");
    }
  }

  const toggleMenu = () => {
    if (openMenu) {
      setOpenMenu(false);
    } else {
      setOpenMenu(true);
    }
  };

  return (
    <div>
      {connectionLoading ? (
        <ScalingLoading />
      ) : (
        <div className="container-fluid d-flex pt-3 px-lg-5">
          <div className="col-xl-3 col-lg-4 d-lg-block d-none left-container">
            <Menu name={name} username={username} users={users} leaveRoom={leaveRoom} />
          </div>

          <div className="col-xl-9 col-lg-8 col-12 d-flex flex-column main-container">
            <div className={`mobile-menu ${openMenu ? "open" : ""} py-2`}>
              <Menu name={name} username={username} users={users} leaveRoom={leaveRoom} />
            </div>

            <div className="chat-title">
              <InfoBar
                room={room}
                leaveRoom={leaveRoom}
                openMenu={openMenu}
                toggleMenu={toggleMenu}
              />
            </div>

            {messageLoading ? (
              <SpinnerLoading />
            ) : (
              <ScrollToBottom className="chat-container flex-grow-1">
                <div className="chat-message-list px-lg-5">
                  <Messages messages={messages} username={username} />
                </div>
              </ScrollToBottom>
            )}

            <div className="chat-form mx-lg-5">
              <Input
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
