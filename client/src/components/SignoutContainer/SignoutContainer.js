import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { FaRegUser } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import "./SignoutContainer.css";

const SignoutContainer = ({ photo, name, username }) => {
  const navigate = useNavigate();

  const handleSignout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="signout-container mx-auto mb-3">
      <div className="d-flex align-items-center m-3">
        <div className="user-icon d-flex justify-content-center align-items-center">
          {photo ? (<img src={photo} alt="profile"></img>) : (<i>
            <FaRegUser />
          </i>)}
        </div>
        <div className="user-name ms-2 ps-1 d-flex flex-column">
          <div className="name">{name}</div>
          <div className="username">@{username}</div>
        </div>
      </div>

      <div className="mx-3 mb-3">
        <button className="btn btn-primary w-100" onClick={handleSignout}>
          Sign out{" "}
          <i>
            <IoIosArrowForward />
          </i>
        </button>
      </div>
    </div>
  );
};

export default SignoutContainer;
