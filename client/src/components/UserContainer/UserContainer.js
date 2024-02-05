import React from "react";
import { GoDotFill } from "react-icons/go";

import "./UserContainer.css";

const UserContainer = ({ users }) => {
  return (
    <div className="user-container ms-4">
      {users && typeof users === "object" ? (
        <div className="active-container ps-3 pt-1">
          <p>
            {Object.values(users).map((user) => (
              <span key={user.id} className="active-users text-capitalize">
                {user.name + " "}
                <i className="text-success">
                  <GoDotFill />
                </i>
                <br />
              </span>
            ))}
          </p>
        </div>
      ) : (
        <div className="no-users-message">
          {users ? "No users in the room" : "Loading..."}
        </div>
      )}
    </div>
  );
};

export default UserContainer;
