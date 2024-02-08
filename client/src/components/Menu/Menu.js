import React from "react";
import { FiPlus } from "react-icons/fi";

import "./Menu.css";

import logo from "../../images/logo.png";
import UserContainer from "../UserContainer/UserContainer";
import SignoutContainer from "../SignoutContainer/SignoutContainer";

const Menu = ({name, username, users, leaveRoom}) => {
  return (
    <div className="menu d-flex flex-column">
      <div className="d-flex ms-4 my-4">
        <img src={logo} alt="AnyChat" className="title-logo me-1" />
        <h1 className="title-name">AnyChat</h1>
      </div>

      <div className="new-chat text-center">
        <button className="btn btn-primary" onClick={leaveRoom}>
          <i className="">
            <FiPlus />
          </i>{" "}
          New chat
        </button>
      </div>

      <h4 className="online-users mt-4 ms-4">Online Users</h4>
      <div className="users-list flex-grow-1 mb-3">
        <UserContainer users={users} />
      </div>

      <SignoutContainer name={name} username={username} />
    </div>
  );
};

export default Menu;
