import React from "react";
import { FaCode, FaRegLightbulb } from "react-icons/fa6";
import { LuThumbsUp } from "react-icons/lu";

import "./SidebarLeft.css";
import avatar1 from "../../assets/avatar-1.png";
import avatar2 from "../../assets/avatar-2.png";
import avatar3 from "../../assets/avatar-3.png";
import arrow from "../../assets/arrow.png";

const SidebarLeft = () => {
  return (
    <div id="sidebar-left">
      <i className="code">
        <FaCode />
      </i>

      <div className="chat-demo">
        <div className="bulb d-flex justify-content-center align-items-center">
          <i>
            <FaRegLightbulb />
          </i>
        </div>

        <div className="d-flex">
          <div className="avatar">
            <img src={avatar1} alt="avatar-1" />
          </div>
          <div className="chat-box ms-1 p-3">
            Hey there! <br /> How has your day been so far?
          </div>
        </div>

        <div className="d-flex mt-5">
          <div className="avatar">
            <img src={avatar2} alt="avatar-2" />
          </div>
          <div className="chat-box ms-1 p-3">
            It's been quite busy. How about yours?
          </div>
        </div>
      </div>

      <div className="d-flex mt-5" style={{ position: "relative" }}>
        <div className="thumbs-up d-flex justify-content-center align-items-center">
          <i>
            <LuThumbsUp />
          </i>
        </div>

        <div className="avatar mx-4">
          <img src={avatar3} alt="avatar-3" />
        </div>

        <div className="oval"></div>

        <div className="arrow">
          <img src={arrow} alt="arrow" />
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
