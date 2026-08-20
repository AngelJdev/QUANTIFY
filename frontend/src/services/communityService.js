import { initSocket } from './socket';

const emitWithAck = (event, payload = {}) => new Promise((resolve, reject) => {
    const socket = initSocket();

    socket.timeout(8000).emit(event, payload, (timeoutError, response) => {
        if (timeoutError) {
            reject(new Error('El servidor tardó demasiado en responder.'));
            return;
        }

        if (!response?.success) {
            reject(new Error(response?.message || 'No se pudo completar la acción.'));
            return;
        }

        resolve(response);
    });
});

export const getCommunityState = () => emitWithAck('community:get_state');
export const searchCommunityUsers = (query) => emitWithAck('community:search', { query });
export const sendFriendRequest = (targetUserId) => emitWithAck('community:friend_request', { targetUserId });
export const respondToFriendRequest = (friendshipId, action) => (
    emitWithAck('community:friend_respond', { friendshipId, action })
);
export const removeFriendship = (friendshipId) => (
    emitWithAck('community:friend_remove', { friendshipId })
);
