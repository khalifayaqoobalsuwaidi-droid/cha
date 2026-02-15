import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, off, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "PASTE_YOURS",
  authDomain: "PASTE_YOURS",
  databaseURL: "PASTE_YOURS",
  projectId: "PASTE_YOURS",
  storageBucket: "PASTE_YOURS",
  messagingSenderId: "PASTE_YOURS",
  appId: "PASTE_YOURS",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

signInAnonymously(auth);

let uid = null;
onAuthStateChanged(auth, (user) => {
  if (user) uid = user.uid;
});

function el(id) { return document.getElementById(id); }

function renderMessage(msg) {
  const box = el("chatBox");
  const wrap = document.createElement("div");
  wrap.className = "message";

  const u = document.createElement("div");
  u.className = "username";
  u.textContent = msg.name || "anon";

  const t = document.createElement("div");
  t.textContent = msg.text || "";

  wrap.appendChild(u);
  wrap.appendChild(t);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}

export function initChat({ getRoom }) {
  let currentListenerRef = null;

  function roomPath() {
    return `rooms/${getRoom()}/messages`;
  }

  function clearChat() {
    el("chatBox").innerHTML = "";
  }

  function switchRoom() {
    if (currentListenerRef) off(currentListenerRef);
    clearChat();

    currentListenerRef = query(ref(db, roomPath()), limitToLast(50));

    onValue(currentListenerRef, (snap) => {
      clearChat();
      const data = snap.val() || {};
      Object.values(data).forEach(renderMessage);
    });
  }

  function send() {
    const name = el("username").value.trim();
    const text = el("messageInput").value.trim();
    if (!name || !text) return;

    push(ref(db, roomPath()), {
      name,
      text,
      uid: uid || "pending",
      ts: Date.now()
    });

    el("messageInput").value = "";
  }

  switchRoom();

  return { send, switchRoom };
}
