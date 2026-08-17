import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
let socket = null;

/**
 * Initialize or get the Socket.io client instance.
 * Automatically joins user's private notification room.
 */
export const initSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true
        });

        socket.on('connect', () => {
            if (userId) {
                socket.emit('join_user_room', userId);
            }
        });
    }

    if (userId && socket.connected) {
        socket.emit('join_user_room', userId);
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
