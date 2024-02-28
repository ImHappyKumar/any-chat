import React from "react";
import { RiSendPlaneFill } from "react-icons/ri";

import "./Input.css";

const Input = ({ message, setMessage, sendMessage }) => (
  <form className="form d-flex">
    <input
      className="input ps-3"
      type="text"
      name="message"
      id="message"
      placeholder="Type your message"
      value={message}
      onChange={(event) => setMessage(event.target.value)}
      onKeyDown={(event) =>
        event.key === "Enter" ? sendMessage(event) : null
      }
    />
    <button className="send-button d-flex align-items-center" onClick={(event) => sendMessage(event)}>
      <i className="pb-1"><RiSendPlaneFill /></i>
    </button>
  </form>
);

export default Input;
