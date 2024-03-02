import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { FaSignOutAlt } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { auth } from "../../firebase";
import "./Home.css";
import logo from "../../images/logo.png";
import ScalingLoading from "../Loading/ScalingLoading";
import Layout from "../Layout/Layout";

const Home = ({ setErrorMessage }) => {
  const [loading, setLoading] = useState(true);
  const [wait, setWait] = useState(false);
  const [signed, setSigned] = useState(false);
  const [user, setUser] = useState({});
  const [isUsernameNotSet, setIsUsernameNotSet] = useState(false);
  const [customRoom, setCustomRoom] = useState(false);
  const navigate = useNavigate();
  const popularRooms = ["Happy Chating", "Talk Time", "Chit Chat"];
  const [selectedRoom, setSelectedRoom] = useState(popularRooms[0]);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setSigned(true);
        const { uid, photoURL } = user;
        const db = getDatabase();
        const userRef = ref(db, `users/${uid}`);

        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            if (!snapshot.val().username) {
              setIsUsernameNotSet(true);
              setUser({
                uid: uid,
                photo: photoURL,
                name: snapshot.val().name,
                email: snapshot.val().email,
              });
            } else {
              setUser({
                uid: uid,
                photo: photoURL,
                name: snapshot.val().name,
                email: snapshot.val().email,
                username: snapshot.val().username,
              });
            }
          }
          setLoading(false);
        } catch (error) {
          setErrorMessage("Error fetching user data");
          setLoading(false);
        }
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    });

    return () => unsubscribe();
  });

  const handleSignout = async () => {
    try {
      await signOut(auth);
      setSigned(false);
      setUser({});
      navigate("/signin");
    } catch (error) {
      setErrorMessage("Error signing out");
    }
  };

  const handleSetUsername = async (data) => {
    const username = data.username.toLowerCase();

    if (username === "admin") {
      setError("username", {
        type: "manual",
        message:
          "'admin' is not allowed as a username. Please choose a different username",
      });
      setWait(false);
      return;
    }

    const usernameExists = await isUsernameTaken(username);

    if (usernameExists) {
      setError("username", {
        type: "manual",
        message: "Username is already taken",
      });
      setWait(false);
      return;
    } else {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        name: user.name,
        email: user.email,
        username: username,
      });
      setUser({ ...user, username: username });
      setIsUsernameNotSet(false);
    }
  };

  const isUsernameTaken = async (username) => {
    try {
      const db = getDatabase();
      const usersRef = ref(db, "users");
      const q = query(usersRef, orderByChild("username"), equalTo(username));
      const snapshot = await get(q);

      return snapshot.exists();
    } catch (error) {
      setErrorMessage("Error checking username");
      throw error;
    }
  };

  const handleSelectedRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleSelectedRoomContinue = () => {
    const room = selectedRoom.toUpperCase();
    navigate(`/chat/${room}`, { state: { user, room } });
  };

  const handleCustomRoomContinue = (data) => {
    const room = data.room.toUpperCase();
    navigate(`/chat/${room}`, { state: { user, room } });
  };

  return (
    <div>
      {loading ? (
        <ScalingLoading />
      ) : (
        <Layout>
          <div id="home">
            {signed && (
              <div className="signout d-flex justify-content-end me-2">
                <i onClick={handleSignout}>
                  <FaSignOutAlt />
                </i>
              </div>
            )}
            <div className="logo d-flex justify-content-center">
              <img src={logo} alt="AnyChat" className="mt-5 mb-3" />
            </div>
            <h3 className="text-center">Unleash AnyChat Conversations</h3>
            {signed ? (
              isUsernameNotSet ? (
                <div>
                  <h6 className="text-center">
                    Welcome <strong>{user.name}</strong>!<br />
                    Please set your username
                  </h6>
                  <form
                    className="mx-auto my-4"
                    onSubmit={handleSubmit(handleSetUsername)}
                    style={{ width: "62%" }}
                  >
                    <div className="mb-3">
                      <Controller
                        name="username"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: "Username is required",
                          validate: (value) => {
                            const minCharacters = 3;
                            const maxCharacters = 15;

                            if (value.indexOf(" ") !== -1) {
                              return "Username must not contain spaces";
                            }

                            if (value.length < minCharacters) {
                              return `Username must contain at least ${minCharacters} characters`;
                            }

                            if (value.length > maxCharacters) {
                              return `Username must not exceed ${maxCharacters} characters`;
                            }

                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.username ? "is-invalid" : ""
                              }`}
                              id="username"
                              placeholder="Username"
                              autoComplete="on"
                              {...field}
                            />
                            {errors.username && (
                              <div className="invalid-feedback">
                                {errors.username.message}
                              </div>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <button
                      disabled={wait}
                      type="submit"
                      className="btn btn-primary mt-3 w-100"
                    >
                      {!wait ? "Continue" : "Please wait..."}
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <h6 className="text-center">
                    Welcome <strong>{user.name}</strong>!<br />
                    To start chatting, please join a room
                  </h6>
                  {!customRoom ? (
                    <div className="mx-auto mt-5" style={{ width: "62%" }}>
                      <div>
                        <div
                          className="btn-group d-flex"
                          role="group"
                          aria-label="Basic radio toggle button group"
                        >
                          <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            value={popularRooms[0]}
                            onChange={handleSelectedRoomChange}
                            checked={selectedRoom === popularRooms[0]}
                            id="btnradio1"
                            autoComplete="off"
                          />
                          <label
                            className="btn btn-outline-primary d-flex justify-content-center align-items-center"
                            htmlFor="btnradio1"
                          >
                            {popularRooms[0]}
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            value={popularRooms[1]}
                            onChange={handleSelectedRoomChange}
                            checked={selectedRoom === popularRooms[1]}
                            id="btnradio2"
                            autoComplete="off"
                          />
                          <label
                            className="btn btn-outline-primary d-flex justify-content-center align-items-center"
                            htmlFor="btnradio2"
                          >
                            {popularRooms[1]}
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            value={popularRooms[2]}
                            onChange={handleSelectedRoomChange}
                            checked={selectedRoom === popularRooms[2]}
                            id="btnradio3"
                            autoComplete="off"
                          />
                          <label
                            className="btn btn-outline-primary d-flex justify-content-center align-items-center"
                            htmlFor="btnradio3"
                          >
                            {popularRooms[2]}
                          </label>
                        </div>

                        <button
                          type="submit"
                          onClick={handleSelectedRoomContinue}
                          className="btn btn-primary mt-3 w-100"
                          style={{ height: "44px" }}
                        >
                          Continue
                        </button>
                      </div>
                      <div className="text-center mt-2 mb-3">
                        <button
                          className="btn-link text-decoration-underline"
                          onClick={() => setCustomRoom(true)}
                        >
                          Custom Room
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <form
                        className="mx-auto mt-5"
                        style={{ width: "62%" }}
                        onSubmit={handleSubmit(handleCustomRoomContinue)}
                      >
                        <Controller
                          name="room"
                          control={control}
                          defaultValue=""
                          rules={{
                            required: "Room ID is required",
                            validate: (value) => {
                              let newValueArray = value.split(/[ ]+/);
                              let newValue = newValueArray.join(" ").trim();
                              const minCharacters = 3;
                              const maxCharacters = 15;

                              if (newValue.length < minCharacters) {
                                return `Room ID must contain at least ${minCharacters} characters`;
                              }

                              if (newValue.length > maxCharacters) {
                                return `Room ID must not exceed ${maxCharacters} characters`;
                              }

                              return true;
                            },
                          }}
                          render={({ field }) => (
                            <>
                              <input
                                type="text"
                                className={`form-control ${
                                  errors.room ? "is-invalid" : ""
                                }`}
                                id="room"
                                placeholder="Room ID"
                                autoComplete="on"
                                {...field}
                              />
                              {errors.room && (
                                <div className="invalid-feedback">
                                  {errors.room.message}
                                </div>
                              )}
                            </>
                          )}
                        />

                        <button
                          type="submit"
                          className="btn btn-primary mt-3 w-100"
                        >
                          Continue
                        </button>
                      </form>
                      <div className="text-center mt-2 mb-3">
                        <button
                          className="btn-link text-decoration-underline"
                          onClick={() => setCustomRoom(false)}
                        >
                          Popular Rooms
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div>
                <h6 className="text-center">
                  To continue, kindly log in with your account
                </h6>
                <div className="d-block w-50 mx-auto my-5">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </button>
                  <button
                    className="btn btn-secondary w-100 mt-2"
                    onClick={() => navigate("/signin")}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}
          </div>
        </Layout>
      )}
    </div>
  );
};

export default Home;
