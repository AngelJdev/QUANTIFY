import { io } from 'socket.io-client';

const getSocketUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000/community';
    return `${window.location.origin}/community`;
};

let communitySocket = null;

export const initCommunitySocket = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!communitySocket) {
        communitySocket = io(getSocketUrl(), {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            auth: { token }
        });
    } else {
        communitySocket.auth = { token };
        if (!communitySocket.connected) communitySocket.connect();
    }

    return communitySocket;
};

export const disconnectCommunitySocket = () => {
    if (!communitySocket) return;
    communitySocket.disconnect();
    communitySocket = null;
};

export default { initCommunitySocket, disconnectCommunitySocket };
