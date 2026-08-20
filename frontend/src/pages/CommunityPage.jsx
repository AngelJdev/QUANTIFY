import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FiCheck, FiClock, FiEdit3, FiRefreshCw, FiSearch, FiUserMinus,
    FiTarget, FiUserPlus, FiUsers, FiWifi, FiWifiOff, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ChallengesPanel from '../components/community/ChallengesPanel';
import CommunityFeed from '../components/community/CommunityFeed';
import { initSocket } from '../services/socket';
import {
    getCommunityState, removeFriendship, respondToFriendRequest,
    searchCommunityUsers, sendFriendRequest
} from '../services/communityService';

const EMPTY_STATE = { friends: [], incoming: [], outgoing: [], discover: [] };

const Avatar = ({ user, large = false }) => {
    const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() || '?';
    return (
        <div className={`relative shrink-0 ${large ? 'h-14 w-14 text-lg' : 'h-11 w-11 text-sm'}`}>
            {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.nombre} className="h-full w-full rounded-2xl object-cover border border-gray-200 dark:border-white/10" />
            ) : (
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black shadow-sm">
                    {initial}
                </div>
            )}
            <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${user?.online ? 'bg-emerald-500' : 'bg-gray-400'}`}
                title={user?.online ? 'En línea' : 'Desconectado'}
            />
        </div>
    );
};

const PersonInfo = ({ user, showEmail = true }) => (
    <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
            <p className="font-extrabold text-textPrimary truncate">{user.nombre}</p>
            {user.is_premium && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase text-amber-600 dark:text-amber-300">Premium</span>}
        </div>
        {showEmail && <p className="text-xs text-textMuted truncate">{user.email}</p>}
        <p className="mt-1 text-[11px] font-bold text-textMuted">
            {user.online ? 'En línea ahora' : `Racha actual: ${user.current_streak || 0} días`}
        </p>
    </div>
);

const CommunityPage = () => {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('friends');
    const [community, setCommunity] = useState(EMPTY_STATE);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [connected, setConnected] = useState(false);
    const [actionKey, setActionKey] = useState(null);
    const [notice, setNotice] = useState(null);

    const onlineFriends = useMemo(
        () => community.friends.filter((friendship) => friendship.user.online).length,
        [community.friends]
    );

    const showNotice = useCallback((text, type = 'success') => setNotice({ text, type }), []);

    const loadState = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const response = await getCommunityState();
            setCommunity(response.data);
            setConnected(true);
        } catch (error) {
            setConnected(false);
            showNotice(error.message, 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [showNotice]);

    useEffect(() => {
        const socket = initSocket();
        const onConnect = () => { setConnected(true); loadState({ silent: true }); };
        const onDisconnect = () => setConnected(false);
        const onConnectError = () => { setConnected(false); showNotice('No se pudo autenticar la conexión en tiempo real.', 'error'); };
        const onStateChanged = () => loadState({ silent: true });
        const onPresenceChanged = ({ userId, online }) => {
            const updateRelations = (items) => items.map((item) => (
                item.user?.id === Number(userId) ? { ...item, user: { ...item.user, online } } : item
            ));
            setCommunity((previous) => ({
                ...previous,
                friends: updateRelations(previous.friends),
                incoming: updateRelations(previous.incoming),
                outgoing: updateRelations(previous.outgoing),
                discover: previous.discover.map((person) => person.id === Number(userId) ? { ...person, online } : person)
            }));
            setSearchResults((previous) => previous.map((person) => person.id === Number(userId) ? { ...person, online } : person));
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('community:state_changed', onStateChanged);
        socket.on('community:presence_changed', onPresenceChanged);
        const initialLoad = window.setTimeout(() => loadState(), 0);

        return () => {
            window.clearTimeout(initialLoad);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('community:state_changed', onStateChanged);
            socket.off('community:presence_changed', onPresenceChanged);
        };
    }, [loadState, showNotice]);

    useEffect(() => {
        if (!notice) return undefined;
        const timeout = window.setTimeout(() => setNotice(null), 3500);
        return () => window.clearTimeout(timeout);
    }, [notice]);

    useEffect(() => {
        const text = query.trim();
        if (text.length < 2) {
            return undefined;
        }
        let cancelled = false;
        const timeout = window.setTimeout(async () => {
            try {
                const response = await searchCommunityUsers(text);
                if (!cancelled) setSearchResults(response.data.users);
            } catch (error) {
                if (!cancelled) showNotice(error.message, 'error');
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 300);
        return () => { cancelled = true; window.clearTimeout(timeout); };
    }, [query, showNotice]);

    const handleQueryChange = (event) => {
        const value = event.target.value;
        setQuery(value);
        const shouldSearch = value.trim().length >= 2;
        setSearching(shouldSearch);
        if (!shouldSearch) {
            setSearchResults([]);
        }
    };

    const runAction = async (key, action) => {
        setActionKey(key);
        try {
            const response = await action();
            showNotice(response.message);
            await loadState({ silent: true });
        } catch (error) {
            showNotice(error.message, 'error');
        } finally {
            setActionKey(null);
        }
    };

    const requestFriend = (targetUserId) => runAction(`request-${targetUserId}`, () => sendFriendRequest(targetUserId));
    const respond = (friendshipId, action) => runAction(`${action}-${friendshipId}`, () => respondToFriendRequest(friendshipId, action));
    const remove = (friendship, needsConfirmation = false) => {
        if (needsConfirmation && !window.confirm(`¿Eliminar a ${friendship.user.nombre} de tus amigos?`)) return;
        runAction(`remove-${friendship.id}`, () => removeFriendship(friendship.id));
    };

    const searchAction = (person) => {
        if (person.relationship === 'FRIEND') return <span className="text-xs font-black text-emerald-500">Amigos</span>;
        if (person.relationship === 'OUTGOING') return <span className="text-xs font-black text-amber-500">Pendiente</span>;
        if (person.relationship === 'INCOMING') {
            return <button onClick={() => respond(person.friendshipId, 'accept')} disabled={Boolean(actionKey)} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white disabled:opacity-50">Aceptar</button>;
        }
        return <button onClick={() => requestFriend(person.id)} disabled={Boolean(actionKey)} className="rounded-xl bg-accent px-3 py-2 text-xs font-black text-gray-950 disabled:opacity-50">Agregar</button>;
    };

    return (
        <div className="w-full space-y-6 fade-in pb-10">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tight text-primary dark:text-white">Comunidad</h1>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${connected ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>
                            {connected ? <FiWifi /> : <FiWifiOff />}{connected ? 'Tiempo real activo' : 'Reconectando'}
                        </span>
                    </div>
                    <p className="font-medium text-textMuted">Conecta con otros Quantifiers y avancen juntos, sin recargar la página.</p>
                </div>
                {activeTab === 'friends' && (
                    <button onClick={() => loadState()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-surface px-5 py-3 text-sm font-extrabold text-textPrimary hover:border-accent disabled:opacity-50 dark:border-white/10">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Sincronizar
                    </button>
                )}
            </header>

            {notice && <div className={`fixed right-6 top-6 z-50 max-w-sm rounded-2xl border px-5 py-4 text-sm font-bold shadow-2xl ${notice.type === 'error' ? 'border-red-500/30 bg-red-950 text-red-100' : 'border-emerald-500/30 bg-emerald-950 text-emerald-100'}`}>{notice.text}</div>}

            <nav className="inline-flex w-full gap-2 rounded-2xl border border-gray-200 bg-surface p-2 dark:border-white/10 sm:w-auto">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all ${activeTab === 'friends' ? 'bg-primary text-surface shadow-sm dark:bg-white dark:text-black' : 'text-textMuted hover:bg-gray-500/10'}`}
                >
                    <FiUsers /> Amigos
                </button>
                <button
                    onClick={() => setActiveTab('challenges')}
                    className={`relative inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all ${activeTab === 'challenges' ? 'bg-primary text-surface shadow-sm dark:bg-white dark:text-black' : 'text-textMuted hover:bg-gray-500/10'}`}
                >
                    <FiTarget /> Retos
                </button>
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`relative inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all ${activeTab === 'feed' ? 'bg-primary text-surface shadow-sm dark:bg-white dark:text-black' : 'text-textMuted hover:bg-gray-500/10'}`}
                >
                    <FiEdit3 /> Muro
                </button>
            </nav>

            {activeTab === 'friends' ? (
                <>
            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    { icon: <FiUsers size={24} />, value: community.friends.length, label: 'Amigos', color: 'text-blue-500 bg-blue-500/15' },
                    { icon: <FiWifi size={24} />, value: onlineFriends, label: 'En línea', color: 'text-emerald-500 bg-emerald-500/15' },
                    { icon: <FiClock size={24} />, value: community.incoming.length, label: 'Solicitudes', color: 'text-amber-500 bg-amber-500/15' }
                ].map((stat) => (
                    <div key={stat.label} className="glass-card flex items-center gap-4 !p-5">
                        <div className={`rounded-2xl p-3 ${stat.color}`}>{stat.icon}</div>
                        <div><p className="text-2xl font-black">{stat.value}</p><p className="text-xs font-bold text-textMuted">{stat.label}</p></div>
                    </div>
                ))}
            </section>

            <section className="glass-card !p-5">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                    <input value={query} onChange={handleQueryChange} placeholder="Buscar por nombre o correo…" className="input-field !pl-12 !pr-12" />
                    {searching && <FiRefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-accent" />}
                </div>
                {query.trim().length >= 2 && (
                    <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
                        {!searching && searchResults.length === 0 && <p className="p-5 text-center text-sm text-textMuted">No encontramos usuarios.</p>}
                        {searchResults.map((person) => (
                            <div key={person.id} className="flex items-center gap-3 bg-surface p-4">
                                <Avatar user={person} /><PersonInfo user={person} />{searchAction(person)}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <section className="glass-card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-white/10">
                        <div><h2 className="text-xl font-black">Tus amigos</h2><p className="text-xs text-textMuted">Presencia actualizada en tiempo real.</p></div>
                        <FiUsers className="text-accent" size={24} />
                    </div>
                    {loading ? (
                        <div className="flex justify-center gap-3 p-12 text-sm font-bold text-textMuted"><FiRefreshCw className="animate-spin" /> Cargando…</div>
                    ) : community.friends.length === 0 ? (
                        <div className="p-12 text-center"><FiUsers className="mx-auto mb-4 text-blue-500" size={34} /><h3 className="font-black">Tu equipo comienza aquí</h3><p className="mt-2 text-sm text-textMuted">Busca a alguien o envía una solicitud.</p></div>
                    ) : (
                        <div className="grid gap-3 p-5 md:grid-cols-2">
                            {community.friends.map((friendship) => (
                                <div key={friendship.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                    <Avatar user={friendship.user} large /><PersonInfo user={friendship.user} showEmail={false} />
                                    <button onClick={() => remove(friendship, true)} disabled={Boolean(actionKey)} className="rounded-xl p-2.5 text-textMuted hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40" title="Eliminar amistad"><FiUserMinus /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="glass-card !p-0 overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-5 dark:border-white/10"><h2 className="text-xl font-black">Solicitudes</h2><p className="text-xs text-textMuted">Responde al instante.</p></div>
                    <div className="space-y-4 p-5">
                        {!community.incoming.length && !community.outgoing.length && <p className="rounded-2xl bg-gray-500/5 p-6 text-center text-sm text-textMuted">No tienes solicitudes pendientes.</p>}
                        {community.incoming.map((friendship) => (
                            <div key={friendship.id} className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
                                <div className="flex items-center gap-3"><Avatar user={friendship.user} /><PersonInfo user={friendship.user} showEmail={false} /></div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button onClick={() => respond(friendship.id, 'accept')} disabled={Boolean(actionKey)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-black text-white disabled:opacity-50"><FiCheck /> Aceptar</button>
                                    <button onClick={() => respond(friendship.id, 'reject')} disabled={Boolean(actionKey)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-black text-red-500 disabled:opacity-50"><FiX /> Rechazar</button>
                                </div>
                            </div>
                        ))}
                        {community.outgoing.map((friendship) => (
                            <div key={friendship.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                <Avatar user={friendship.user} /><PersonInfo user={friendship.user} showEmail={false} />
                                <button onClick={() => remove(friendship)} disabled={Boolean(actionKey)} className="rounded-xl p-2 text-textMuted hover:bg-red-500/10 hover:text-red-500" title="Cancelar solicitud"><FiX /></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="space-y-4">
                <div><h2 className="text-2xl font-black">Descubre personas</h2><p className="text-sm text-textMuted">Usuarios nuevos fuera de tu red.</p></div>
                {!community.discover.length ? (
                    <div className="glass-card text-center text-sm text-textMuted">No hay más personas por sugerir.</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {community.discover.map((person) => (
                            <article key={person.id} className="glass-card flex flex-col items-center text-center !p-5">
                                <Avatar user={person} large /><div className="mt-3 w-full"><PersonInfo user={person} showEmail={false} /></div>
                                <button onClick={() => requestFriend(person.id)} disabled={Boolean(actionKey)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-black text-surface disabled:opacity-50 dark:bg-white dark:text-black"><FiUserPlus /> Agregar amigo</button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
                </>
            ) : activeTab === 'challenges' ? (
                <ChallengesPanel friends={community.friends} showNotice={showNotice} />
            ) : (
                <CommunityFeed currentUser={currentUser} showNotice={showNotice} />
            )}

            <p className="text-center text-xs text-textMuted">Sesión activa como <span className="font-black text-textPrimary">{currentUser?.nombre}</span>. Sincronización mediante Socket.IO.</p>
        </div>
    );
};

export default CommunityPage;
