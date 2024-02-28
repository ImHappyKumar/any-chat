import React from "react";

import "./AlertMessage.css";

const AlertMessage = ({ alertMessage }) => (
  <div className="alert-messages d-flex flex-column justify-content-center align-items-center py-3">
    <div className="alert-message px-2 py-1 my-1">{alertMessage}</div>
  </div>
);

export default AlertMessage;
