import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000";
  // En desarrollo Vite reenvía /socket.io al backend configurado.
  return window.location.origin;
};

const SOCKET_URL = getSocketUrl();
let socket = null;

/**
 * Initialize or get the Socket.io client instance.
 * The backend resolves the private room from the authenticated JWT.
 */
export const initSocket = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      auth: { token },
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, disconnectSocket };
