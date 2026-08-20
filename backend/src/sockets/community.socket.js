import { Op } from 'sequelize';
import Friendship from '../models/friendship.model.js';
import User from '../models/user.model.js';

const USER_ATTRIBUTES = [
    'id',
    'nombre',
    'email',
    'avatar_url',
    'current_streak',
    'max_streak',
    'is_premium'
];

const friendshipIncludes = [
    { model: User, as: 'userOne', attributes: USER_ATTRIBUTES },
    { model: User, as: 'userTwo', attributes: USER_ATTRIBUTES }
];

const pairFor = (firstId, secondId) => ({
    user_one_id: Math.min(firstId, secondId),
    user_two_id: Math.max(firstId, secondId)
});

const maskEmail = (email = '') => {
    const [name = '', domain = ''] = email.split('@');
    if (!domain) return '';
    return `${name.slice(0, 2)}${name.length > 2 ? '***' : ''}@${domain}`;
};

const publicUser = (user, isOnline) => ({
    id: user.id,
    nombre: user.nombre,
    email: maskEmail(user.email),
    avatar_url: user.avatar_url,
    current_streak: user.current_streak || 0,
    max_streak: user.max_streak || 0,
    is_premium: Boolean(user.is_premium),
    online: isOnline(user.id)
});

const otherUser = (friendship, currentUserId) => (
    friendship.user_one_id === currentUserId ? friendship.userTwo : friendship.userOne
);

const serializeFriendship = (friendship, currentUserId, isOnline) => ({
    id: friendship.id,
    status: friendship.status,
    requestedByMe: friendship.requested_by_id === currentUserId,
    createdAt: friendship.created_at,
    updatedAt: friendship.updated_at,
    user: publicUser(otherUser(friendship, currentUserId), isOnline)
});

const notifyPair = (io, friendship, reason) => {
    const payload = { reason, friendshipId: friendship.id };
    io.to(`user_${friendship.user_one_id}`).emit('community:state_changed', payload);
    io.to(`user_${friendship.user_two_id}`).emit('community:state_changed', payload);
};

const getState = async (currentUserId, isOnline) => {
    const friendships = await Friendship.findAll({
        where: {
            [Op.or]: [
                { user_one_id: currentUserId },
                { user_two_id: currentUserId }
            ]
        },
        include: friendshipIncludes,
        order: [['updated_at', 'DESC']]
    });

    const relatedUserIds = new Set([currentUserId]);
    const state = { friends: [], incoming: [], outgoing: [] };

    friendships.forEach((friendship) => {
        const serialized = serializeFriendship(friendship, currentUserId, isOnline);
        relatedUserIds.add(serialized.user.id);

        if (friendship.status === 'ACCEPTED') state.friends.push(serialized);
        else if (serialized.requestedByMe) state.outgoing.push(serialized);
        else state.incoming.push(serialized);
    });

    const discover = await User.findAll({
        where: { id: { [Op.notIn]: [...relatedUserIds] } },
        attributes: USER_ATTRIBUTES,
        order: [['fecha_creacion', 'DESC']],
        limit: 8
    });

    return {
        ...state,
        discover: discover.map((user) => publicUser(user, isOnline))
    };
};

const acknowledgeError = (ack, error) => {
    const isValidationError = error?.name === 'SequelizeValidationError'
        || error?.name === 'SequelizeUniqueConstraintError';
    const message = isValidationError
        ? 'La solicitud no pudo procesarse porque ya existe una relación entre ambos usuarios.'
        : 'No se pudo completar la acción. Inténtalo nuevamente.';

    console.error('Community socket error:', error);
    ack?.({ success: false, message });
};

export const registerCommunityHandlers = (io, socket, presence) => {
    const currentUserId = socket.user.id;
    const isOnline = (userId) => presence.has(Number(userId));

    socket.on('community:get_state', async (_payload, ack) => {
        try {
            const data = await getState(currentUserId, isOnline);
            ack?.({ success: true, data });
        } catch (error) {
            acknowledgeError(ack, error);
        }
    });

    socket.on('community:search', async ({ query = '' } = {}, ack) => {
        try {
            const normalizedQuery = query.trim();
            if (normalizedQuery.length < 2) {
                return ack?.({ success: true, data: { users: [] } });
            }

            const users = await User.findAll({
                where: {
                    id: { [Op.ne]: currentUserId },
                    [Op.or]: [
                        { nombre: { [Op.like]: `%${normalizedQuery}%` } },
                        { email: { [Op.like]: `%${normalizedQuery}%` } }
                    ]
                },
                attributes: USER_ATTRIBUTES,
                limit: 15
            });

            const userIds = users.map((user) => user.id);
            const friendships = userIds.length
                ? await Friendship.findAll({
                    where: {
                        [Op.or]: [
                            { user_one_id: currentUserId, user_two_id: { [Op.in]: userIds } },
                            { user_two_id: currentUserId, user_one_id: { [Op.in]: userIds } }
                        ]
                    }
                })
                : [];

            const relationshipByUserId = new Map();
            friendships.forEach((friendship) => {
                const targetId = friendship.user_one_id === currentUserId
                    ? friendship.user_two_id
                    : friendship.user_one_id;
                relationshipByUserId.set(targetId, {
                    friendshipId: friendship.id,
                    relationship: friendship.status === 'ACCEPTED'
                        ? 'FRIEND'
                        : friendship.requested_by_id === currentUserId ? 'OUTGOING' : 'INCOMING'
                });
            });

            const results = users.map((user) => ({
                ...publicUser(user, isOnline),
                relationship: relationshipByUserId.get(user.id)?.relationship || null,
                friendshipId: relationshipByUserId.get(user.id)?.friendshipId || null
            }));

            ack?.({ success: true, data: { users: results } });
        } catch (error) {
            acknowledgeError(ack, error);
        }
    });

    socket.on('community:friend_request', async ({ targetUserId } = {}, ack) => {
        try {
            const targetId = Number(targetUserId);
            if (!Number.isInteger(targetId) || targetId <= 0 || targetId === currentUserId) {
                return ack?.({ success: false, message: 'Selecciona un usuario válido.' });
            }

            const target = await User.findByPk(targetId, { attributes: ['id'] });
            if (!target) return ack?.({ success: false, message: 'El usuario ya no existe.' });

            const pair = pairFor(currentUserId, targetId);
            const existing = await Friendship.findOne({ where: pair });
            if (existing) {
                const message = existing.status === 'ACCEPTED'
                    ? 'Este usuario ya está en tu lista de amigos.'
                    : 'Ya existe una solicitud pendiente entre ambos usuarios.';
                return ack?.({ success: false, message });
            }

            const friendship = await Friendship.create({
                ...pair,
                requested_by_id: currentUserId,
                status: 'PENDING'
            });

            notifyPair(io, friendship, 'REQUEST_CREATED');
            io.to(`user_${targetId}`).emit('community:friend_request_received', {
                friendshipId: friendship.id
            });
            ack?.({ success: true, message: 'Solicitud enviada.' });
        } catch (error) {
            acknowledgeError(ack, error);
        }
    });

    socket.on('community:friend_respond', async ({ friendshipId, action } = {}, ack) => {
        try {
            if (!['accept', 'reject'].includes(action)) {
                return ack?.({ success: false, message: 'Respuesta inválida.' });
            }

            const friendship = await Friendship.findByPk(Number(friendshipId));
            const isParticipant = friendship
                && [friendship.user_one_id, friendship.user_two_id].includes(currentUserId);
            const canRespond = isParticipant
                && friendship.status === 'PENDING'
                && friendship.requested_by_id !== currentUserId;

            if (!canRespond) {
                return ack?.({ success: false, message: 'Esta solicitud ya no está disponible.' });
            }

            if (action === 'accept') {
                friendship.status = 'ACCEPTED';
                await friendship.save();
                notifyPair(io, friendship, 'REQUEST_ACCEPTED');
                ack?.({ success: true, message: 'Ahora son amigos.' });
            } else {
                await friendship.destroy();
                notifyPair(io, friendship, 'REQUEST_REJECTED');
                ack?.({ success: true, message: 'Solicitud rechazada.' });
            }
        } catch (error) {
            acknowledgeError(ack, error);
        }
    });

    socket.on('community:friend_remove', async ({ friendshipId } = {}, ack) => {
        try {
            const friendship = await Friendship.findByPk(Number(friendshipId));
            const isParticipant = friendship
                && [friendship.user_one_id, friendship.user_two_id].includes(currentUserId);
            const canRemove = isParticipant && (
                friendship.status === 'ACCEPTED' || friendship.requested_by_id === currentUserId
            );

            if (!canRemove) {
                return ack?.({ success: false, message: 'No puedes eliminar esta relación.' });
            }

            const reason = friendship.status === 'ACCEPTED' ? 'FRIEND_REMOVED' : 'REQUEST_CANCELLED';
            const message = friendship.status === 'ACCEPTED' ? 'Amistad eliminada.' : 'Solicitud cancelada.';
            await friendship.destroy();
            notifyPair(io, friendship, reason);
            ack?.({ success: true, message });
        } catch (error) {
            acknowledgeError(ack, error);
        }
    });
};
