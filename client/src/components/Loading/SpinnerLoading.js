import React from "react";

import "./Loading.css";
import Loading from "../../assets/loading.svg";

const SpinnerLoading = () => {
  return (
    <div className="spinner-loading d-flex justify-content-center align-items-center">
      <img src={Loading} alt="loading" />
    </div>
  );
};

export default SpinnerLoading;
