import React from "react";

import "./Loading.css";
import Loading from "../../images/logo.png";

const ScalingLoading = () => {
  return (
    <div className="scaling-loading d-flex justify-content-center align-items-center">
      <img src={Loading} alt="loading" />
    </div>
  );
};

export default ScalingLoading;