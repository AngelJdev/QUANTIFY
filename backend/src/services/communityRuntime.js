import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import Friendship from '../models/friendship.model.js';
import { Challenge, ChallengeParticipant } from '../models/challenge.model.js';
import {
    CommunityPost,
    CommunityReaction,
    CommunityComment
} from '../models/communityPost.model.js';

const communityModels = [
    Friendship,
    Challenge,
    ChallengeParticipant,
    CommunityPost,
    CommunityReaction,
    CommunityComment
];

export const initializeCommunitySchema = async () => {
    try {
        // sync() sin alter solo crea las tablas faltantes de Comunidad.
        // No modifica ni elimina columnas de los demas modulos.
        for (const model of communityModels) {
            await model.sync();
        }
        console.log('✅ Community tables are ready.');
        return true;
    } catch (error) {
        // Comunidad puede quedar temporalmente fuera de servicio sin detener la API.
        console.error('⚠️ Community tables could not be initialized:', error.message);
        return false;
    }
};

export const configureCommunityScaling = async (communityNamespace) => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.warn('⚠️ REDIS_URL is not configured; sockets will use local memory.');
        return false;
    }

    let publisher;
    let subscriber;

    try {
        publisher = createClient({ url: redisUrl });
        subscriber = publisher.duplicate();

        publisher.on('error', (error) => {
            console.error('⚠️ Community Redis publisher error:', error.message);
        });
        subscriber.on('error', (error) => {
            console.error('⚠️ Community Redis subscriber error:', error.message);
        });

        await Promise.all([publisher.connect(), subscriber.connect()]);
        // El adaptador se aplica solo al namespace /community. Los sockets de
        // administracion, analitica y otros modulos conservan su adaptador.
        communityNamespace.adapter = createAdapter(publisher, subscriber)(communityNamespace);
        console.log('✅ Community sockets are using Redis.');
        return true;
    } catch (error) {
        console.error('⚠️ Redis unavailable; sockets continue with local memory:', error.message);
        await Promise.allSettled([
            publisher?.isOpen ? publisher.quit() : Promise.resolve(),
            subscriber?.isOpen ? subscriber.quit() : Promise.resolve()
        ]);
        return false;
    }
};
