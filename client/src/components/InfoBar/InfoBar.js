import React from "react";
import { Link } from "react-router-dom";
import { FiXCircle, FiX } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";

import "./InfoBar.css";

const InfoBar = ({ room, openMenu, toggleMenu }) => {

  return (
    <div className="info-bar d-flex justify-content-between align-items-center mx-3">
      <div className="left-inner-container">
        <h4 className="text-uppercase">Room Id: {room}</h4>
      </div>
      <div className="right-inner-container d-lg-block d-none mb-3">
        <Link to="/">
          <i className="text-danger">
            <FiXCircle />
          </i>
        </Link>
      </div>
      <div className="right-inner-container d-lg-none d-block mb-3">
        <i onClick={toggleMenu}>
          {(!openMenu)?(<GiHamburgerMenu />):(<FiX />)}
        </i>
      </div>
    </div>
  );
};

export default InfoBar;
