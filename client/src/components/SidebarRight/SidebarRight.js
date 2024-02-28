import React from "react";
import { FaXmark, FaQuestion } from "react-icons/fa6";

import "./SidebarRight.css";
import avatar4 from "../../images/avatar-4.png";
import cat from "../../images/cat.png";

const SidebarRight = () => {
  return (
    <div id="sidebar-right">
      <i className="x-mark">
        <FaXmark />
      </i>

      <div className="chat-demo">
        <div className="question d-flex justify-content-center align-items-center">
          <i>
            <FaQuestion />
          </i>
        </div>

        <div className="oval-quadrant"></div>

        <div className="d-flex flex-column align-items-end">
          <div className="chat-box d-flex ms-1 px-4 py-3">
            <div>
              <div className="rectangle rectangle-large"></div>
              <div className="rectangle rectangle-small mt-2"></div>
            </div>
            <div className="avatar ms-2">
              <img src={avatar4} alt="avatar-4" />
            </div>
          </div>

          <div className="chat-box-media mt-3 p-3">
            <p>Oh, that's too cute!</p>
            <img src={cat} alt="cat" className="d-block mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
