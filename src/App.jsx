import { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIsjMGWtzjjFgjVFiF1fcVU0RNS-i63OY",
  authDomain: "rudra-sule.firebaseapp.com",
  projectId: "rudra-sule",
  storageBucket: "rudra-sule.firebasestorage.app",
  messagingSenderId: "338468684478",
  appId: "1:338468684478:web:105b997840f1ce09b654ef",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account created!");
    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FFFC00",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial"
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            width: "350px",
            textAlign: "center"
          }}
        >
          <h1>👻 Welcome</h1>

          <p>{user.email}</p>

          <button
            onClick={() => signOut(auth)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "20px",
              background: "black",
              color: "white",
              border: "none"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFC00",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          width: "350px"
        }}
      >
        <h1>👻 SnapWeb Auth</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px"
          }}
        />

        <input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px"
          }}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            marginTop: "10px",
            padding: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "18px"
          }}
        >
          {showPassword ? "🙈 Hide" : "👁 Show"}
        </button>
        
        <button
          onClick={signup}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "black",
            color: "white",
            border: "none"
          }}
        >
          Sign Up
        </button>

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            background: "#333",
            color: "white",
            border: "none"
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}