import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIsjMGWtzjjFgjVFiF1fcVU0RNS-i63OY",
  authDomain: "rudra-sule.firebaseapp.com",
  projectId: "rudra-sule",
  storageBucket: "rudra-sule.firebasestorage.app",
  messagingSenderId: "338468684478",
  appId: "1:338468684478:web:105b997840f1ce09b654ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function SnapWebClone() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("Rudra");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: input,
      user: username,
      createdAt: Date.now(),
    });

    setInput("");
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-4">
        {/* Sidebar */}
        <div className="bg-black text-white p-6 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">👻 SnapWeb</h1>
            <p className="text-sm text-gray-300 mt-1">
              Real-time chat website
            </p>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-2xl">
              💬 Live Chat
            </button>
            <button className="w-full bg-zinc-800 py-3 rounded-2xl">
              🌍 Stories
            </button>
            <button className="w-full bg-zinc-800 py-3 rounded-2xl">
              👤 Friends
            </button>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl mt-auto">
            <p className="text-sm text-gray-400 mb-2">Your username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-black outline-none"
            />
          </div>
        </div>

        {/* Main Chat */}
        <div className="md:col-span-3 flex flex-col bg-gray-100 h-[80vh]">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">💬 Global Chat</h2>
            <div className="text-sm text-gray-500">
              Talk with your friends live 🚀
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] p-4 rounded-2xl shadow ${
                  msg.user === username
                    ? "bg-yellow-400 ml-auto"
                    : "bg-white"
                }`}
              >
                <p className="font-bold text-sm mb-1">{msg.user}</p>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-white p-4 border-t flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-yellow-400"
            />

            <button
              onClick={sendMessage}
              className="bg-black text-white px-6 rounded-2xl hover:bg-zinc-800 transition"
            >
              Send 🚀
            </button>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl max-w-6xl w-full">
        <h2 className="text-2xl font-bold mb-4">⚙️ How To Make It Work</h2>

        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Create a Firebase project.</li>
          <li>Enable Firestore Database.</li>
          <li>Copy Firebase config into this code.</li>
          <li>Run: npm install firebase</li>
          <li>Start website using: npm run dev</li>
          <li>Share website link with friends 🌍</li>
        </ol>
      </div>
    </div>
  );
}
