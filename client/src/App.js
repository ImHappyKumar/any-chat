import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Signin from "./pages/Signin/Signin";
import Chat from "./pages/Chat/Chat";
import ErrorAlert from "./components/ErrorAlert/ErrorAlert";

const App = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  return (
    <Router>
      {errorMessage && (
        <ErrorAlert
          errorMessage={errorMessage}
          clearErrorMessage={clearErrorMessage}
        />
      )}
      <Routes>
        <Route
          exact
          path="/"
          element={<Home setErrorMessage={setErrorMessage} />}
        />
        <Route
          exact
          path="/signup"
          element={<Signup setErrorMessage={setErrorMessage} />}
        />
        <Route
          exact
          path="/signin"
          element={<Signin setErrorMessage={setErrorMessage} />}
        />
        <Route
          exact
          path="/chat/:id"
          element={<Chat setErrorMessage={setErrorMessage} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
