import { initCommunitySocket } from './communitySocket';

const emitWithAck = (event, payload = {}) => new Promise((resolve, reject) => {
    const socket = initCommunitySocket();

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

export const getCommunityChallenges = () => emitWithAck('community:challenges_get');
export const createCommunityChallenge = (challenge) => emitWithAck('community:challenge_create', challenge);
export const respondToChallenge = (challengeId, action) => (
    emitWithAck('community:challenge_respond', { challengeId, action })
);
export const addChallengeProgress = (challengeId, amount) => (
    emitWithAck('community:challenge_progress', { challengeId, amount })
);
export const cancelCommunityChallenge = (challengeId) => (
    emitWithAck('community:challenge_cancel', { challengeId })
);

export const getCommunityFeed = () => emitWithAck('community:feed_get');
export const createCommunityPost = (content, visibility) => (
    emitWithAck('community:post_create', { content, visibility })
);
export const deleteCommunityPost = (postId) => emitWithAck('community:post_delete', { postId });
export const reactToCommunityPost = (postId, type) => (
    emitWithAck('community:post_react', { postId, type })
);
export const createCommunityComment = (postId, content) => (
    emitWithAck('community:comment_create', { postId, content })
);
export const deleteCommunityComment = (commentId) => (
    emitWithAck('community:comment_delete', { commentId })
);
