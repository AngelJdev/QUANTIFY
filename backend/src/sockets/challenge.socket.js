import { Op } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import { Challenge, ChallengeParticipant } from '../models/challenge.model.js';
import Friendship from '../models/friendship.model.js';
import User from '../models/user.model.js';

const USER_ATTRIBUTES = ['id', 'nombre', 'avatar_url'];

const pairFor = (firstId, secondId) => ({
    user_one_id: Math.min(firstId, secondId),
    user_two_id: Math.max(firstId, secondId)
});

const challengeInclude = {
    model: Challenge,
    as: 'challenge',
    required: true,
    where: { status: { [Op.ne]: 'CANCELLED' } },
    include: [
        { model: User, as: 'creator', attributes: USER_ATTRIBUTES },
        {
            model: ChallengeParticipant,
            as: 'participants',
            include: [{ model: User, as: 'user', attributes: USER_ATTRIBUTES }]
        }
    ]
};

const today = () => new Date().toISOString().slice(0, 10);

const serializeChallenge = (membership, currentUserId, isOnline) => {
    const challenge = membership.challenge;
    const accepted = challenge.participants
        .filter((participant) => participant.invitation_status === 'ACCEPTED')
        .sort((first, second) => (
            second.progress - first.progress
            || new Date(first.updated_at) - new Date(second.updated_at)
        ));

    const leaderboard = accepted.map((participant, index) => ({
        rank: index + 1,
        progress: participant.progress,
        percentage: Math.min(100, Math.round((participant.progress / challenge.target) * 100)),
        user: {
            id: participant.user.id,
            nombre: participant.user.nombre,
            avatar_url: participant.user.avatar_url,
            online: isOnline(participant.user.id)
        }
    }));

    const myPosition = leaderboard.find((participant) => participant.user.id === currentUserId);
    const expired = challenge.end_date < today();

    return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        target: challenge.target,
        unit: challenge.unit,
        endDate: challenge.end_date,
        status: expired ? 'COMPLETED' : challenge.status,
        isCreator: challenge.creator_id === currentUserId,
        invitationStatus: membership.invitation_status,
        myProgress: membership.progress,
        myPercentage: Math.min(100, Math.round((membership.progress / challenge.target) * 100)),
        myRank: myPosition?.rank || null,
        participantCount: accepted.length,
        pendingInvitations: challenge.participants.filter((participant) => participant.invitation_status === 'INVITED').length,
        creator: {
            id: challenge.creator.id,
            nombre: challenge.creator.nombre,
            avatar_url: challenge.creator.avatar_url
        },
        leaderboard
    };
};

const getChallengeState = async (currentUserId, isOnline) => {
    const memberships = await ChallengeParticipant.findAll({
        where: {
            user_id: currentUserId,
            invitation_status: { [Op.in]: ['INVITED', 'ACCEPTED'] }
        },
        include: [challengeInclude],
        order: [['updated_at', 'DESC']]
    });

    const state = { invitations: [], active: [], completed: [] };
    memberships.forEach((membership) => {
        const serialized = serializeChallenge(membership, currentUserId, isOnline);
        if (membership.invitation_status === 'INVITED') state.invitations.push(serialized);
        else if (serialized.status === 'COMPLETED') state.completed.push(serialized);
        else state.active.push(serialized);
    });
    return state;
};

const getRecipientIds = async (challengeId, extraUserIds = []) => {
    const participants = await ChallengeParticipant.findAll({
        where: { challenge_id: challengeId },
        attributes: ['user_id']
    });
    return [...new Set([...participants.map((participant) => participant.user_id), ...extraUserIds])];
};

const notifyChallenge = async (io, challengeId, reason, extraUserIds = []) => {
    const recipientIds = await getRecipientIds(challengeId, extraUserIds);
    recipientIds.forEach((userId) => {
        io.to(`user_${userId}`).emit('community:challenge_changed', { challengeId, reason });
    });
};

const challengeError = (ack, error) => {
    console.error('Challenge socket error:', error);
    ack?.({ success: false, message: 'No se pudo completar la acción del reto.' });
};

export const registerChallengeHandlers = (io, socket, presence) => {
    const currentUserId = socket.user.id;
    const isOnline = (userId) => presence.has(Number(userId));

    socket.on('community:challenges_get', async (_payload, ack) => {
        try {
            const data = await getChallengeState(currentUserId, isOnline);
            ack?.({ success: true, data });
        } catch (error) {
            challengeError(ack, error);
        }
    });

    socket.on('community:challenge_create', async (payload = {}, ack) => {
        const transaction = await sequelize.transaction();
        try {
            const title = String(payload.title || '').trim();
            const description = String(payload.description || '').trim();
            const target = Number(payload.target);
            const unit = String(payload.unit || 'avances').trim();
            const endDate = String(payload.endDate || '');
            const friendIds = [...new Set((payload.friendIds || []).map(Number))]
                .filter((userId) => Number.isInteger(userId) && userId > 0 && userId !== currentUserId);

            if (title.length < 3 || title.length > 80) {
                await transaction.rollback();
                return ack?.({ success: false, message: 'El nombre debe tener entre 3 y 80 caracteres.' });
            }
            if (description.length > 240 || !Number.isInteger(target) || target < 1 || target > 10000 || unit.length < 1 || unit.length > 24) {
                await transaction.rollback();
                return ack?.({ success: false, message: 'Revisa la meta, unidad y descripción del reto.' });
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate <= today()) {
                await transaction.rollback();
                return ack?.({ success: false, message: 'La fecha límite debe ser posterior a hoy.' });
            }
            const maximumDate = new Date();
            maximumDate.setFullYear(maximumDate.getFullYear() + 1);
            if (endDate > maximumDate.toISOString().slice(0, 10) || friendIds.length < 1 || friendIds.length > 10) {
                await transaction.rollback();
                return ack?.({ success: false, message: 'Invita entre 1 y 10 amigos y usa una fecha menor a un año.' });
            }

            const friendships = await Friendship.findAll({
                where: {
                    status: 'ACCEPTED',
                    [Op.or]: friendIds.map((friendId) => pairFor(currentUserId, friendId))
                },
                transaction
            });
            if (friendships.length !== friendIds.length) {
                await transaction.rollback();
                return ack?.({ success: false, message: 'Solo puedes invitar a personas que sean tus amigos.' });
            }

            const challenge = await Challenge.create({
                creator_id: currentUserId,
                title,
                description: description || null,
                target,
                unit,
                end_date: endDate
            }, { transaction });

            await ChallengeParticipant.bulkCreate([
                { challenge_id: challenge.id, user_id: currentUserId, invitation_status: 'ACCEPTED' },
                ...friendIds.map((friendId) => ({
                    challenge_id: challenge.id,
                    user_id: friendId,
                    invitation_status: 'INVITED'
                }))
            ], { transaction });

            await transaction.commit();
            await notifyChallenge(io, challenge.id, 'CHALLENGE_CREATED');
            ack?.({ success: true, message: 'Reto creado e invitaciones enviadas.', data: { challengeId: challenge.id } });
        } catch (error) {
            if (!transaction.finished) await transaction.rollback();
            challengeError(ack, error);
        }
    });

    socket.on('community:challenge_respond', async ({ challengeId, action } = {}, ack) => {
        try {
            if (!['accept', 'reject'].includes(action)) {
                return ack?.({ success: false, message: 'Respuesta inválida.' });
            }
            const membership = await ChallengeParticipant.findOne({
                where: { challenge_id: Number(challengeId), user_id: currentUserId },
                include: [{ model: Challenge, as: 'challenge' }]
            });
            if (!membership || membership.invitation_status !== 'INVITED' || membership.challenge.status !== 'ACTIVE') {
                return ack?.({ success: false, message: 'Esta invitación ya no está disponible.' });
            }

            if (action === 'accept') {
                membership.invitation_status = 'ACCEPTED';
                await membership.save();
                await notifyChallenge(io, membership.challenge_id, 'CHALLENGE_ACCEPTED');
                ack?.({ success: true, message: 'Te uniste al reto.' });
            } else {
                const challengeIdToNotify = membership.challenge_id;
                await membership.destroy();
                await notifyChallenge(io, challengeIdToNotify, 'CHALLENGE_REJECTED', [currentUserId]);
                ack?.({ success: true, message: 'Invitación rechazada.' });
            }
        } catch (error) {
            challengeError(ack, error);
        }
    });

    socket.on('community:challenge_progress', async ({ challengeId, amount = 1 } = {}, ack) => {
        try {
            const increment = Number(amount);
            if (!Number.isInteger(increment) || increment < 1 || increment > 1000) {
                return ack?.({ success: false, message: 'El avance debe ser un número válido.' });
            }
            const membership = await ChallengeParticipant.findOne({
                where: { challenge_id: Number(challengeId), user_id: currentUserId },
                include: [{ model: Challenge, as: 'challenge' }]
            });
            const canAdvance = membership
                && membership.invitation_status === 'ACCEPTED'
                && membership.challenge.status === 'ACTIVE'
                && membership.challenge.end_date >= today();
            if (!canAdvance) {
                return ack?.({ success: false, message: 'Este reto ya no acepta avances.' });
            }

            membership.progress = Math.min(membership.challenge.target, membership.progress + increment);
            await membership.save();
            await notifyChallenge(io, membership.challenge_id, 'PROGRESS_UPDATED');
            ack?.({ success: true, message: 'Avance registrado.', data: { progress: membership.progress } });
        } catch (error) {
            challengeError(ack, error);
        }
    });

    socket.on('community:challenge_cancel', async ({ challengeId } = {}, ack) => {
        try {
            const challenge = await Challenge.findByPk(Number(challengeId));
            if (!challenge || challenge.creator_id !== currentUserId || challenge.status !== 'ACTIVE') {
                return ack?.({ success: false, message: 'No puedes cancelar este reto.' });
            }
            challenge.status = 'CANCELLED';
            await challenge.save();
            await notifyChallenge(io, challenge.id, 'CHALLENGE_CANCELLED');
            ack?.({ success: true, message: 'Reto cancelado.' });
        } catch (error) {
            challengeError(ack, error);
        }
    });
};
