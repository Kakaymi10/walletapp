import React, { useEffect, useState } from "react";
import { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import Login from "./login";
import {auth, app} from './config'
import Home from "../components/home";

const AUTH_STORAGE_KEY = "mywalletapp";

function SignIn() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedToken) {
      setUser(storedToken);
    }
  }, []);

  const handleSwitch = () => {
    setLogin(!login);
  };

  const handleAuthentication = async (event, authFunction) => {
    event.preventDefault();

    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;

    authFunction(auth, email, password)
      .then((data) => {
        const token = data.user.email;
        window.localStorage.setItem(AUTH_STORAGE_KEY, token);
        setUser(token);
      })
      .catch((err) => {
        const errorMessage = login ? "Invalid email or password. Please try again." : "User in use. Please use another email or login.";
        alert(errorMessage);
      });
  };

  const handleSignout = async () => {
    signOut(auth).then(() => {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setLogin(true);
      setUser(null);
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const token = result.user.email;
      window.localStorage.setItem(AUTH_STORAGE_KEY, token);
      setUser(token);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
            <Home signout={handleSignout}
            user={user.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}/>

        </div>
      ) : (
        <div>
          <Login
            submitted={(event) => handleAuthentication(event, login ? signInWithEmailAndPassword : createUserWithEmailAndPassword)}
            title={login ? "Login" : "Sign Up"}
            forgot={login ? "Forgot password?" : ""}
            submit={login ? "Login" : "Sign Up"}
            lab_not_member={login ? "Not a member?" : "Have an account?"}
            not_member={login ? "Sign Up" : "Login"}
            switch={handleSwitch}
            handleGoogleSignIn={handleGoogleSignIn}
          />
        </div>
      )}
    </div>
  );
}

export default SignIn;
