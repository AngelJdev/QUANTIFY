import { Op } from 'sequelize';
import Friendship from '../models/friendship.model.js';
import {
    CommunityComment,
    CommunityPost,
    CommunityReaction
} from '../models/communityPost.model.js';
import User from '../models/user.model.js';

const USER_ATTRIBUTES = ['id', 'nombre', 'avatar_url', 'is_premium'];
const REACTION_TYPES = ['SUPPORT', 'FIRE', 'APPLAUSE'];

const acceptedFriendIds = async (userId) => {
    const friendships = await Friendship.findAll({
        where: {
            status: 'ACCEPTED',
            [Op.or]: [{ user_one_id: userId }, { user_two_id: userId }]
        },
        attributes: ['user_one_id', 'user_two_id']
    });
    return friendships.map((friendship) => (
        friendship.user_one_id === userId ? friendship.user_two_id : friendship.user_one_id
    ));
};

const canViewPost = async (post, userId) => {
    if (post.user_id === userId || post.visibility === 'PUBLIC') return true;
    const friendship = await Friendship.findOne({
        where: {
            status: 'ACCEPTED',
            [Op.or]: [
                { user_one_id: Math.min(post.user_id, userId), user_two_id: Math.max(post.user_id, userId) }
            ]
        },
        attributes: ['id']
    });
    return Boolean(friendship);
};

const postIncludes = [
    { model: User, as: 'author', attributes: USER_ATTRIBUTES },
    { model: CommunityReaction, as: 'reactions', attributes: ['user_id', 'type'] },
    {
        model: CommunityComment,
        as: 'comments',
        attributes: ['id', 'user_id', 'content', 'created_at'],
        include: [{ model: User, as: 'author', attributes: USER_ATTRIBUTES }]
    }
];

const serializePost = (post, currentUserId, isOnline) => {
    const reactionCounts = { SUPPORT: 0, FIRE: 0, APPLAUSE: 0 };
    post.reactions.forEach((reaction) => { reactionCounts[reaction.type] += 1; });

    return {
        id: post.id,
        content: post.content,
        visibility: post.visibility,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        isMine: post.user_id === currentUserId,
        author: {
            id: post.author.id,
            nombre: post.author.nombre,
            avatar_url: post.author.avatar_url,
            is_premium: Boolean(post.author.is_premium),
            online: isOnline(post.author.id)
        },
        reactions: reactionCounts,
        myReaction: post.reactions.find((reaction) => reaction.user_id === currentUserId)?.type || null,
        comments: [...post.comments]
            .sort((first, second) => new Date(first.created_at) - new Date(second.created_at))
            .map((comment) => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.created_at,
                canDelete: comment.user_id === currentUserId || post.user_id === currentUserId,
                author: {
                    id: comment.author.id,
                    nombre: comment.author.nombre,
                    avatar_url: comment.author.avatar_url,
                    isMine: comment.user_id === currentUserId
                }
            }))
    };
};

const getFeed = async (currentUserId, isOnline) => {
    const friendIds = await acceptedFriendIds(currentUserId);
    const posts = await CommunityPost.findAll({
        where: {
            [Op.or]: [
                { user_id: { [Op.in]: [currentUserId, ...friendIds] } },
                { visibility: 'PUBLIC' }
            ]
        },
        include: postIncludes,
        order: [['created_at', 'DESC']],
        limit: 30,
        distinct: true
    });
    return { posts: posts.map((post) => serializePost(post, currentUserId, isOnline)) };
};

const notifyFeed = async (io, post, reason) => {
    const payload = { postId: post.id, reason };
    if (post.visibility === 'PUBLIC') {
        io.emit('community:feed_changed', payload);
        return;
    }
    const friendIds = await acceptedFriendIds(post.user_id);
    [post.user_id, ...friendIds].forEach((userId) => {
        io.to(`user_${userId}`).emit('community:feed_changed', payload);
    });
};

const tooSoon = (socket, action, delay) => {
    const now = Date.now();
    const lastAction = socket.data[action] || 0;
    if (now - lastAction < delay) return true;
    socket.data[action] = now;
    return false;
};

const feedError = (ack, error) => {
    console.error('Community feed socket error:', error);
    ack?.({ success: false, message: 'No se pudo completar la acción en el muro.' });
};

export const registerFeedHandlers = (io, socket, presence) => {
    const currentUserId = socket.user.id;
    const isOnline = (userId) => presence.has(Number(userId));

    socket.on('community:feed_get', async (_payload, ack) => {
        try {
            const data = await getFeed(currentUserId, isOnline);
            ack?.({ success: true, data });
        } catch (error) {
            feedError(ack, error);
        }
    });

    socket.on('community:post_create', async ({ content, visibility = 'FRIENDS' } = {}, ack) => {
        try {
            const cleanContent = String(content || '').trim();
            if (cleanContent.length < 1 || cleanContent.length > 600 || !['FRIENDS', 'PUBLIC'].includes(visibility)) {
                return ack?.({ success: false, message: 'La publicación debe tener entre 1 y 600 caracteres.' });
            }
            if (tooSoon(socket, 'lastPostAt', 1500)) {
                return ack?.({ success: false, message: 'Espera un momento antes de publicar otra vez.' });
            }
            const post = await CommunityPost.create({ user_id: currentUserId, content: cleanContent, visibility });
            await notifyFeed(io, post, 'POST_CREATED');
            ack?.({ success: true, message: 'Publicación compartida.', data: { postId: post.id } });
        } catch (error) {
            feedError(ack, error);
        }
    });

    socket.on('community:post_delete', async ({ postId } = {}, ack) => {
        try {
            const post = await CommunityPost.findByPk(Number(postId));
            if (!post || post.user_id !== currentUserId) {
                return ack?.({ success: false, message: 'No puedes eliminar esta publicación.' });
            }
            await CommunityReaction.destroy({ where: { post_id: post.id } });
            await CommunityComment.destroy({ where: { post_id: post.id } });
            await post.destroy();
            await notifyFeed(io, post, 'POST_DELETED');
            ack?.({ success: true, message: 'Publicación eliminada.' });
        } catch (error) {
            feedError(ack, error);
        }
    });

    socket.on('community:post_react', async ({ postId, type } = {}, ack) => {
        try {
            if (!REACTION_TYPES.includes(type)) {
                return ack?.({ success: false, message: 'Selecciona una reacción válida.' });
            }
            const post = await CommunityPost.findByPk(Number(postId));
            if (!post || !(await canViewPost(post, currentUserId))) {
                return ack?.({ success: false, message: 'La publicación ya no está disponible.' });
            }
            const existing = await CommunityReaction.findOne({ where: { post_id: post.id, user_id: currentUserId } });
            let message = 'Reacción agregada.';
            if (existing?.type === type) {
                await existing.destroy();
                message = 'Reacción retirada.';
            } else if (existing) {
                existing.type = type;
                await existing.save();
            } else {
                await CommunityReaction.create({ post_id: post.id, user_id: currentUserId, type });
            }
            await notifyFeed(io, post, 'REACTION_CHANGED');
            ack?.({ success: true, message });
        } catch (error) {
            feedError(ack, error);
        }
    });

    socket.on('community:comment_create', async ({ postId, content } = {}, ack) => {
        try {
            const cleanContent = String(content || '').trim();
            if (cleanContent.length < 1 || cleanContent.length > 300) {
                return ack?.({ success: false, message: 'El comentario debe tener entre 1 y 300 caracteres.' });
            }
            if (tooSoon(socket, 'lastCommentAt', 800)) {
                return ack?.({ success: false, message: 'Espera un momento antes de comentar otra vez.' });
            }
            const post = await CommunityPost.findByPk(Number(postId));
            if (!post || !(await canViewPost(post, currentUserId))) {
                return ack?.({ success: false, message: 'La publicación ya no está disponible.' });
            }
            const comment = await CommunityComment.create({ post_id: post.id, user_id: currentUserId, content: cleanContent });
            await notifyFeed(io, post, 'COMMENT_CREATED');
            ack?.({ success: true, message: 'Comentario agregado.', data: { commentId: comment.id } });
        } catch (error) {
            feedError(ack, error);
        }
    });

    socket.on('community:comment_delete', async ({ commentId } = {}, ack) => {
        try {
            const comment = await CommunityComment.findByPk(Number(commentId), {
                include: [{ model: CommunityPost, as: 'post' }]
            });
            const canDelete = comment && (
                comment.user_id === currentUserId || comment.post.user_id === currentUserId
            );
            if (!canDelete) {
                return ack?.({ success: false, message: 'No puedes eliminar este comentario.' });
            }
            const post = comment.post;
            await comment.destroy();
            await notifyFeed(io, post, 'COMMENT_DELETED');
            ack?.({ success: true, message: 'Comentario eliminado.' });
        } catch (error) {
            feedError(ack, error);
        }
    });
};
