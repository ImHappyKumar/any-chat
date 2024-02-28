import React from "react";

import Message from "../Message/Message";

const Messages = ({ messages, username }) => (
  <div className="messages py-3">
    {messages.map((message, i) => (
      <div key={i} className="d-grid">
        <Message message={message} username={username} />
      </div>
    ))}
  </div>
);

export default Messages;
