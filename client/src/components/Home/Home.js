import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { FaSignOutAlt } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../firebase";
import "./Home.css";
import logo from "../../images/logo.png";
import ScalingLoading from "../Loading/ScalingLoading";
import Layout from "../Layout/Layout";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setSigned(true);
        const { uid } = user;
        const db = getDatabase();
        const userRef = ref(db, `users/${uid}`);

        try {
          const snapshot = await get(userRef);

          setUser({
            name: snapshot.val().name,
            email: snapshot.val().email,
            username: snapshot.val().username,
          });

          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignout = async () => {
    try {
      await signOut(auth);
      setSigned(false);
      setUser({});
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleContinue = (data) => {
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
              <div>
                <h6 className="text-center">
                  Welcome {user.name}!<br />
                  To start chatting, please join a room
                </h6>
                <form
                  className="mx-auto w-50 mt-5 mb-4"
                  onSubmit={handleSubmit(handleContinue)}
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

                  <button type="submit" className="btn btn-primary mt-3 w-100">
                    Continue
                  </button>
                </form>
              </div>
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
