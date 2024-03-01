import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useForm, Controller } from "react-hook-form";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { auth } from "../../firebase";

import "./Signin.css";

import ScalingLoading from "../Loading/ScalingLoading";
import Layout from "../Layout/Layout";

const Signin = () => {
  const [loading, setLoading] = useState(true);
  const [wait, setWait] = useState(false);
  const [isSignInWithGoogle, setIsSignInWithGoogle] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        if (isSignInWithGoogle) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            await set(userRef, {
              name: user.displayName,
              username: null,
              email: user.email,
            });
          }
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  });

  const handleSignIn = async (data) => {
    setWait(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      if (user && user.emailVerified) {
        navigate("/");
      } else if (user && !user.emailVerified) {
        setError("email", {
          type: "manual",
          message: "Email is not verified. Please verify your email",
        });
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("email", {
          type: "manual",
          message: "Invalid Email or Password",
        });
        setError("password", {
          type: "manual",
          message: "Invalid Email or Password",
        });
      } else {
        alert("An error occurred during signin. Please try again.");
      }
    }
    setWait(false);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsSignInWithGoogle(true);
      await signInWithPopup(auth, provider);
    } catch (error) {
      setIsSignInWithGoogle(false);
      console.error(error);
    }
  };

  return (
    <div>
      {loading ? (
        <ScalingLoading />
      ) : (
        <Layout>
          <div className="m-3" id="signin">
            <h3 className="text-center">Sign in to your account</h3>
            <form
              className="mx-auto w-75 mt-5 mb-4"
              onSubmit={handleSubmit(handleSignIn)}
            >
              <div className="mb-3">
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <>
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        id="email"
                        autoComplete="on"
                        {...field}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="mb-3">
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Password is required" }}
                  render={({ field }) => (
                    <>
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        id="password"
                        autoComplete="current-password"
                        {...field}
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
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

            <div className="w-75 mx-auto">
              <div className="line-container my-3">
                <div className="line"></div>
                <div className="text">Or</div>
                <div className="line"></div>
              </div>
              <button
                className="btn btn-primary d-flex justify-content-center align-items-center w-100"
                onClick={signInWithGoogle}
              >
                <i
                  className="me-2 d-flex align-items-center"
                  style={{ fontSize: "20px" }}
                >
                  <FcGoogle />
                </i>
                Sign in with Google
              </button>
              <p className="signup text-center my-4">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
};

export default Signin;
