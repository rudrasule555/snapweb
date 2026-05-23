import { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

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
const db = getFirestore(app);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  
  const setOnlineStatus = async (status) => {
    if (!user) return;

    await setDoc(
      doc(db, "status", user.uid),
      {
        email: user.email,
        online: status,
        lastSeen: new Date().toLocaleString(),
      }
    );
  };

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setOnlineStatus(true);
      }
    });

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    const unsubscribeTyping = onSnapshot(
      doc(db, "typing", "status"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (
            data.user !== user?.email &&
            data.targetUser === user?.email
          ) {
            setTypingUser(data.user);
            setLiveText(data.text);
          } else {
            setTypingUser("");
            setLiveText("");
          }
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
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
  const deleteAllMessages = async () => {
    const snapshot = await getDocs(
      collection(db, "messages")
    );

  snapshot.forEach(async (messageDoc) => {
    await deleteDoc(
      doc(db, "messages", messageDoc.id)
      );
    });
  };
  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      user: user.email,
      createdAt: new Date().toLocaleString(),
    });

    setMessage("");
  };

  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FFFC00",
          padding: "20px",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "auto",
            background: "white",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          {typingUser && (
            <div
              style={{
                background: "#f1f1f1",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <strong>✍️ {typingUser}</strong>

              <p>{liveText}</p>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>👻 SnapWeb Chat</h1>

            <button
              onClick={deleteAllMessages}
              style={{
                adding: "10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "10px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              🗑 Delete Chats
            </button>

            <button
              onClick={async () => {
                await setOnlineStatus(false);
                window.location.reload();
                signOut(auth);
              }}
              style={{
                padding: "10px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Logout
            </button>
          </div>

          <p>Logged in as: {user.email}</p>

          <div
            style={{
              height: "400px",
              overflowY: "scroll",
              border: "1px solid gray",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background:
                    msg.user === user.email
                      ? "#FFFC00"
                      : "#f1f1f1",
                  padding: "10px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              >
              <strong>
                🟢 {msg.user}
              </strong>
                <p>{msg.text}</p>

              <small style={{ color: "gray" }}>
                {msg.createdAt}
              </small>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <input
              value={message}
              onChange={async (e) => {
                setMessage(e.target.value);

                await setDoc(
                  doc(db, "typing", "status"),
                  {
                    user: user.email,
                    text: e.target.value,
                    targetUser: "naruto@gmail.com",
                  }
                );

                setTimeout(async () => {
                  await setDoc(
                    doc(db, "typing", "status"),
                    {
                      user: "",
                      text: "",
                      targetUser: "",
                    }
                  );
                }, 1000);
              }}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid gray",
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "12px 20px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Send
            </button>
          </div>
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
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          width: "350px",
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
            marginTop: "20px",
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
            marginTop: "10px",
          }}
        />

        <button
          onClick={() =>
            setShowPassword(!showPassword)
          }
          style={{
            marginTop: "10px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
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
            border: "none",
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
            border: "none",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}