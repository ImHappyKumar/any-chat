import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useForm, Controller } from "react-hook-form";
import { auth } from "../../firebase";

import "./Signup.css";

import ScalingLoading from "../Loading/ScalingLoading";
import Layout from "../Layout/Layout";

const Signup = () => {
  const [loading, setLoading] = useState(true);
  const [wait, setWait] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(null);
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
        navigate("/");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  });

  const handleSignUp = async (data) => {
    setWait(true);
    const name = toCapitalized(data.name);
    const username = data.username.toLowerCase();

    try {
      const usernameExists = await isUsernameTaken(username);
      if (usernameExists) {
        setError("username", {
          type: "manual",
          message: "Username is already taken",
        });
        setWait(false);
        return;
      }

      if (username === "admin") {
        setError("username", {
          type: "manual",
          message:
            "'admin' is not allowed as a username. Please choose a different username",
        });
        setWait(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await updateProfile(user, {
        displayName: name,
      });

      const userCredentialSignin = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const userSignin = userCredentialSignin.user;

      if (userSignin) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
          name: name,
          username: username,
          email: data.email,
        });
      } else {
        setWait(false);
        alert("Signup completed, but unable to signin");
      }

      setEmail(data.email);
      setStep(2);
    } catch (error) {
      setWait(false);
      if (error.code.includes("email")) {
        let errorMessage = error.code.replaceAll("auth/", "");
        errorMessage = errorMessage.replaceAll("-", " ");
        errorMessage =
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
        setError("email", {
          type: "manual",
          message: errorMessage,
        });
        await deleteUserOnError();
      } else if (error.code.includes("password")) {
        let errorMessage = error.code.replaceAll("auth/", "");
        errorMessage = errorMessage.replaceAll("-", " ");
        errorMessage =
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
        setError("password", {
          type: "manual",
          message: errorMessage,
        });
        await deleteUserOnError();
      } else {
        console.error(error.code, error.message);
        await deleteUserOnError();
        alert("An error occurred during sign-up. Please try again.");
      }
    }

    setWait(false);
  };

  const toCapitalized = (name) => {
    let newNameArray = name.split(/[ ]+/);
    let newName = newNameArray.join(" ").trim();

    let words = newName.toLowerCase().split(" ");
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
    name = words.join(" ");

    return name;
  };

  const isUsernameTaken = async (username) => {
    try {
      const db = getDatabase();
      const usersRef = ref(db, "users");
      const q = query(usersRef, orderByChild("username"), equalTo(username));
      const snapshot = await get(q);

      return snapshot.exists();
    } catch (error) {
      console.error("Error checking username:", error);
      throw error;
    }
  };

  const deleteUserOnError = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        await deleteUser(currentUser);
      }

      const db = getDatabase();

      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        await set(userRef, null);
      }

      console.log("User deleted successfully on error.");
    } catch (error) {
      console.error("Error deleting user:", error.message);
    }
  };

  return (
    <div>
      {loading ? (
        <ScalingLoading />
      ) : (
        <Layout>
          {step === 1 && (
            <div className="m-3" id="signup">
              <h3 className="text-center">Create your account</h3>
              <form
                className="mx-auto w-75 mt-5 mb-4"
                onSubmit={handleSubmit(handleSignUp)}
              >
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Name is required",
                    validate: (value) => {
                      let newValueArray = value.split(/[ ]+/);
                      let newValue = newValueArray.join(" ").trim();
                      const minCharacters = 3;
                      const maxCharacters = 20;

                      if (newValue.length < minCharacters) {
                        return `Name must contain at least ${minCharacters} characters`;
                      }

                      if (newValue.length > maxCharacters) {
                        return `Name must not exceed ${maxCharacters} characters`;
                      }

                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <>
                      <label htmlFor="name" className="form-label w-100">
                        Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        id="name"
                        autoComplete="on"
                        {...field}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name.message}
                        </div>
                      )}
                    </>
                  )}
                />

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
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.username ? "is-invalid" : ""
                        }`}
                        id="username"
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
                        type="text"
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

                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    maxLength: {
                      value: 14,
                      message: "Password must not exceed 14 characters",
                    },
                  }}
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
                        autoComplete="new-password"
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

                <button
                  disabled={wait}
                  type="submit"
                  className="btn btn-primary mt-3 w-100"
                >
                  {!wait ? "Continue" : "Please wait..."}
                </button>
              </form>

              <p className="signin text-center mb-4">
                Already have an account? <Link to="/signin">Sign in</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="m-3 text-center" id="signup">
              <h3>Verify your email</h3>
              <p className="mt-4 mb-3">
                Thank you for registering! <br />
                We've sent a verification link to <span>{email}</span>. Please
                check your inbox and click on the link to verify your account.
              </p>

              <button
                onClick={() => {
                  navigate("/signin");
                }}
                className="btn btn-primary w-50"
              >
                Sign in
              </button>
            </div>
          )}
        </Layout>
      )}
    </div>
  );
};

export default Signup;
