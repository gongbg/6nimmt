import { initializeApp } from "./ui.js";

if (typeof window.io !== "function") {
  throw new Error("Socket.io client library is not loaded.");
}

if (!window.__sixNimmtAppInitialized) {
  window.__sixNimmtAppInitialized = true;
  const socket = io(window.location.origin);
  window.__sixNimmtSocket = socket;
  initializeApp(socket);
}
