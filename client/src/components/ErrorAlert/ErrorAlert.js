import React, { useEffect } from "react";
import { MdError } from "react-icons/md";

import "./ErrorAlert.css";

const ErrorAlert = ({ errorMessage, clearErrorMessage }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      clearErrorMessage();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [errorMessage, clearErrorMessage]);

  return (
    <div
      className={`error ${errorMessage ? "show" : ""} d-flex px-3 py-2`}
      id="error-alert"
    >
      <i className="d-flex align-items-center me-1">
        <MdError />
      </i>
      {errorMessage}
    </div>
  );
};

export default ErrorAlert;
