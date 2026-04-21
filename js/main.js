import { initializeApp } from "./ui.js";

if (typeof window.io !== "function") {
  throw new Error("Socket.io client library is not loaded.");
}

const socket = io(window.location.origin);

initializeApp(socket);
