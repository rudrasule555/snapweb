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
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIsjMGWtzjjFgjVFiF1fcVU0RNS-i63OY",
  authDomain: "rudra-sule.firebaseapp.com",
  projectId: "rudra-sule",
  storageBucket: "rudra-sule.firebasestorage.app",
  messagingSenderId: "338468684478",
  appId: "1:338468684478:web:105b997840f1ce09b654ef"
}

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [image, setImage] = useState(null);

  const [typingUser, setTypingUser] = useState("");
  const [liveText, setLiveText] = useState("");

  // ONLINE STATUS
  const setOnlineStatus = async (status) => {
    if (!user) return;

    await setDoc(doc(db, "status", user.uid), {
      email: user.email,
      online: status,
      lastSeen: new Date().toLocaleString(),
    });
  };

  // AUTH + REALTIME MESSAGES
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await setDoc(
          doc(db, "status", currentUser.uid),
          {
            email: currentUser.email,
            online: true,
            lastSeen: new Date().toLocaleString(),
          }
        );
      }   
    });

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
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
      unsubscribeAuth();
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [user]);

  // SIGNUP
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

  // LOGIN
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

  // DELETE ALL MESSAGES
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

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    let imageUrl = "";

    if (image) {
      const imageRef = ref(
        storage,
        `images/${Date.now()}-${image.name}`
      );

      await uploadBytes(imageRef, image);

      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(collection(db, "messages"), {
      text: message,
      imageUrl,
      user: user.email,
      createdAt: Date.now(),
      time: new Date().toLocaleString(),
    });

    setMessage("");
    setImage(null);
  };

  // CHAT SCREEN
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
                padding: "10px",
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
                await signOut(auth);
                window.location.reload();
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
                <strong>🟢 {msg.user}</strong>

                <p>{msg.text}</p>

                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="sent"
                    style={{
                      width: "200px",
                      borderRadius: "10px",
                      marginTop: "10px",
                    }}
                  />
                )}

                <small style={{ color: "gray" }}>
                  {msg.time}
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
                    targetUser:
                      user.email === "naruto@gmail.com"
                        ? "hinata@gmail.com"
                        : "naruto@gmail.com",
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

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files[0])
              }
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

  // LOGIN SCREEN
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
          onChange={(e) =>
            setEmail(e.target.value)
          }
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
          onChange={(e) =>
            setPassword(e.target.value)
          }
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