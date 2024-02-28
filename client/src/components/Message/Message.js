import React from "react";
import ReactEmoji from "react-emoji";
import { PiClockCountdownBold } from "react-icons/pi";

import "./Message.css";

import AlertMessage from "../AlertMessage/AlertMessage";

const Message = ({
  message: { sender, content, timestamp, status },
  username,
}) => {
  const date = new Date(timestamp);

  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  const formattedDate = date.toLocaleString("en-IN", options);

  let isSentByAdmin = false;
  let isSentByCurrentUser = false;

  if (sender === "admin") {
    isSentByAdmin = true;
  } else if (sender === username) {
    isSentByCurrentUser = true;
  }

  return (
    <>
      {isSentByAdmin ? (
        <AlertMessage alertMessage={content} />
      ) : isSentByCurrentUser ? (
        <div className="message-container-right mb-3">
          <div className="message-box">
            <p
              className={`message-text m-0 px-4 ${
                status !== "success" ? "pt-3" : "py-3"
              }`}
            >
              {ReactEmoji.emojify(content)}
            </p>
            {status !== "success" && (
              <div className="message-wait text-end pe-2 pb-2">
                <PiClockCountdownBold />
              </div>
            )}
          </div>
          <div className="date-time text-end m-0">{formattedDate}</div>
        </div>
      ) : (
        <div className="message-container-left mb-3">
          <p className="sent-text m-0">{sender}</p>
          <div className="message-box px-4 py-3">
            <p className="message-text m-0">{ReactEmoji.emojify(content)}</p>
          </div>
          <p className="date-time text-start m-0">{formattedDate}</p>
        </div>
      )}
    </>
  );
};

export default Message;
