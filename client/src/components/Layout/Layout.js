import React from "react";
import SidebarLeft from "../SidebarLeft/SidebarLeft";
import SidebarRight from "../SidebarRight/SidebarRight";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="container d-flex align-items-center" id="layout">
      <div className="col-xxl-3 col-lg-4 d-lg-block d-none left">
        <SidebarLeft />
      </div>
      <div className="col-xxl-6 col-lg-4 col-12 mid">{children}</div>
      <div className="col-xxl-3 col-lg-4 d-lg-block d-none right">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Layout;
