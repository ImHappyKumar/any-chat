import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { getDatabase, ref, get } from "firebase/database";

import "./Chat.css";

import ScalingLoading from "../../components/Loading/ScalingLoading";
import SpinnerLoading from "../../components/Loading/SpinnerLoading";
import Menu from "../../components/Menu/Menu";
import InfoBar from "../../components/InfoBar/InfoBar";
import Input from "../../components/Input/Input";
import Messages from "../../components/Messages/Messages";

import ScrollToBottom from "react-scroll-to-bottom";

let socket;

const Chat = ({ setErrorMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const outsideMenuRef = useRef(null);
  const insideMenuRef = useRef(null);

  const ENDPOINT = process.env.REACT_APP_ENDPOINT || "http://localhost:8000";

  // To join room
  useEffect(() => {
    const { photo, name, username } = location.state.user;
    const room = location.state.room;

    socket = io(ENDPOINT);

    socket.on("connect_error", (error) => {
      setErrorMessage(
        "Failed to connect to the server. Please try again later."
      );
      navigate("/");
    });

    socket.on("connect_failed", () => {
      setErrorMessage(
        "Server connection refused. Please check your internet connection and try again."
      );
      navigate("/");
    });

    setPhoto(photo);
    setName(name);
    setUsername(username);
    setRoom(room);

    socket.emit("join", { name, username, room }, (error) => {
      if (error) {
        setErrorMessage(error);
        navigate("/");
      }
    });

    fetchMessages(room);

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line 
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
      setErrorMessage("Internal Server Error");
      setMessageLoading(false);
    }
  };

  // To update messages array whenever a message is sent by admin or user
  useEffect(() => {
    socket.on("message", (message) => {
      if (message.sender !== username) {
        setMessages([...messages, message]);
      } else {
        const uniqueMessages = messages.reduce((acc, message) => {
          if (!acc.some((item) => item.id === message.id)) {
            acc.push(message);
          }
          return acc;
        }, []);

        setMessages(uniqueMessages);
      }
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
      setConnectionLoading(false);
    });
  }, [messages, username]);

  //function for sending messages
  const sendMessage = async (event) => {
    event.preventDefault();

    if (message) {
      const messageToSend = {
        id: uuidv4(),
        sender: username,
        content: message,
        timestamp: Date.now(),
        status: "pending",
      };
      setMessage("");
      setMessages([...messages, messageToSend]);
      socket.emit("sendMessage", messageToSend, () => {
        setMessages((prevMessages) => {
          return prevMessages.map((message) =>
            message.id === messageToSend.id
              ? { ...message, status: "success" }
              : message
          );
        });
      });
    }
  };

  const leaveRoom = () => {
    socket.disconnect();
    if (socket.disconnected) {
      navigate("/");
    } else {
      setErrorMessage("Unable to disconnect");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenu &&
        outsideMenuRef.current.contains(event.target) &&
        !insideMenuRef.current.contains(event.target)
      ) {
        setOpenMenu(!openMenu);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div ref={outsideMenuRef}>
      {connectionLoading ? (
        <ScalingLoading />
      ) : (
        <div className="container-fluid d-flex pt-3 px-lg-5">
          <div className="col-xl-3 col-lg-4 d-lg-block d-none left-container">
            <Menu
              photo={photo}
              name={name}
              username={username}
              room={room}
              users={users}
              leaveRoom={leaveRoom}
            />
          </div>

          <div className="col-xl-9 col-lg-8 col-12 d-flex flex-column main-container">
            <div
              className={`mobile-menu ${openMenu ? "open" : ""} py-2`}
              ref={insideMenuRef}
            >
              <Menu
                photo={photo}
                name={name}
                username={username}
                room={room}
                users={users}
                leaveRoom={leaveRoom}
              />
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
