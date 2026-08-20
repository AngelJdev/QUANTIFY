import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FiAward, FiCalendar, FiCheck, FiChevronDown, FiChevronUp,
    FiClock, FiFlag, FiPlus, FiRefreshCw, FiTarget, FiTrash2,
    FiTrendingUp, FiUserPlus, FiUsers, FiX
} from 'react-icons/fi';
import { initCommunitySocket } from '../../services/communitySocket';
import {
    addChallengeProgress,
    cancelCommunityChallenge,
    createCommunityChallenge,
    getCommunityChallenges,
    respondToChallenge
} from '../../services/communityService';

const EMPTY_CHALLENGES = { invitations: [], active: [], completed: [] };

const dateAfterDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

const formatDate = (date) => new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric'
}).format(new Date(`${date}T12:00:00`));

const MiniAvatar = ({ user, rank }) => (
    <div className="relative h-10 w-10 shrink-0">
        {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.nombre} className="h-full w-full rounded-xl object-cover" />
        ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white">
                {user.nombre?.charAt(0)?.toUpperCase()}
            </div>
        )}
        {rank && rank <= 3 && (
            <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ${rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-400' : 'bg-orange-600'}`}>
                {rank}
            </span>
        )}
    </div>
);

const Ranking = ({ challenge }) => (
    <div className="space-y-2">
        {challenge.leaderboard.map((participant) => (
            <div key={participant.user.id} className="flex items-center gap-3 rounded-2xl bg-gray-500/5 p-3 dark:bg-white/[0.03]">
                <MiniAvatar user={participant.user} rank={participant.rank} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-extrabold text-textPrimary">{participant.user.nombre}</p>
                        <p className="shrink-0 text-xs font-black text-accent">{participant.progress}/{challenge.target} {challenge.unit}</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${participant.percentage}%` }} />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ChallengeCard = ({ challenge, actionKey, progressAmount, onProgress, onAmountChange, onCancel, completed = false }) => (
    <article className="glass-card !p-0 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-5 dark:border-white/10">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${completed ? 'bg-gray-500/15 text-textMuted' : 'bg-emerald-500/15 text-emerald-500'}`}>
                            {completed ? 'Finalizado' : 'En curso'}
                        </span>
                        {challenge.isCreator && <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-blue-500">Creado por ti</span>}
                    </div>
                    <h3 className="text-xl font-black text-textPrimary">{challenge.title}</h3>
                    {challenge.description && <p className="mt-1 text-sm text-textMuted">{challenge.description}</p>}
                </div>
                <div className="rounded-2xl bg-accent/15 p-3 text-accent"><FiTarget size={24} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-textMuted">
                <span className="inline-flex items-center gap-1.5"><FiFlag /> Meta: {challenge.target} {challenge.unit}</span>
                <span className="inline-flex items-center gap-1.5"><FiCalendar /> {formatDate(challenge.endDate)}</span>
                <span className="inline-flex items-center gap-1.5"><FiUsers /> {challenge.participantCount} participantes</span>
            </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-textMuted">Tu avance</p>
                <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-black text-textPrimary">{challenge.myProgress}</span>
                    <span className="pb-1 text-sm font-bold text-textMuted">de {challenge.target} {challenge.unit}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${challenge.myPercentage}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-textMuted">
                    {challenge.myRank ? `Posición actual: #${challenge.myRank}` : 'Esperando clasificación'}
                </p>

                {!completed && challenge.myProgress < challenge.target && (
                    <div className="mt-5 flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={progressAmount}
                            onChange={(event) => onAmountChange(challenge.id, event.target.value)}
                            className="input-field !w-24 !px-3 !py-2.5 text-center text-sm font-black"
                            aria-label="Cantidad de avance"
                        />
                        <button
                            onClick={() => onProgress(challenge.id)}
                            disabled={Boolean(actionKey)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-black text-gray-950 disabled:opacity-50"
                        >
                            <FiTrendingUp /> Registrar avance
                        </button>
                    </div>
                )}

                {challenge.myProgress >= challenge.target && !completed && (
                    <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 text-center text-sm font-black text-emerald-500">
                        <FiAward className="mx-auto mb-2" size={24} /> ¡Completaste la meta!
                    </div>
                )}

                {!completed && challenge.isCreator && (
                    <button onClick={() => onCancel(challenge)} disabled={Boolean(actionKey)} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:underline disabled:opacity-50">
                        <FiTrash2 /> Cancelar reto
                    </button>
                )}
            </div>
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-textMuted">Clasificación en vivo</p>
                    <span className="text-[10px] font-bold text-textMuted">Actualización por sockets</span>
                </div>
                <Ranking challenge={challenge} />
            </div>
        </div>
    </article>
);

const ChallengesPanel = ({ friends, showNotice }) => {
    const [challenges, setChallenges] = useState(EMPTY_CHALLENGES);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [actionKey, setActionKey] = useState(null);
    const [progressAmounts, setProgressAmounts] = useState({});
    const [form, setForm] = useState({
        title: '', description: '', target: 7, unit: 'días', endDate: dateAfterDays(7), friendIds: []
    });

    const loadChallenges = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const response = await getCommunityChallenges();
            setChallenges(response.data);
        } catch (error) {
            showNotice(error.message, 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [showNotice]);

    useEffect(() => {
        const socket = initCommunitySocket();
        const onChanged = () => loadChallenges({ silent: true });
        const initialLoad = window.setTimeout(() => loadChallenges(), 0);
        socket.on('community:challenge_changed', onChanged);
        return () => {
            window.clearTimeout(initialLoad);
            socket.off('community:challenge_changed', onChanged);
        };
    }, [loadChallenges]);

    const totals = useMemo(() => ({
        active: challenges.active.length,
        invitations: challenges.invitations.length,
        completed: challenges.completed.length
    }), [challenges]);

    const updateForm = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
    const toggleFriend = (friendId) => {
        if (!form.friendIds.includes(friendId) && form.friendIds.length >= 10) {
            showNotice('Puedes invitar como máximo a 10 amigos.', 'error');
            return;
        }
        setForm((previous) => ({
            ...previous,
            friendIds: previous.friendIds.includes(friendId)
                ? previous.friendIds.filter((id) => id !== friendId)
                : [...previous.friendIds, friendId]
        }));
    };

    const runAction = async (key, action) => {
        setActionKey(key);
        try {
            const response = await action();
            showNotice(response.message);
            await loadChallenges({ silent: true });
            return true;
        } catch (error) {
            showNotice(error.message, 'error');
            return false;
        } finally {
            setActionKey(null);
        }
    };

    const createChallenge = async (event) => {
        event.preventDefault();
        const created = await runAction('create', () => createCommunityChallenge({
            ...form,
            target: Number(form.target)
        }));
        if (created) {
            setForm({ title: '', description: '', target: 7, unit: 'días', endDate: dateAfterDays(7), friendIds: [] });
            setShowCreate(false);
        }
    };

    const respond = (challengeId, action) => runAction(`${action}-${challengeId}`, () => respondToChallenge(challengeId, action));
    const registerProgress = (challengeId) => {
        const amount = Number(progressAmounts[challengeId] || 1);
        return runAction(`progress-${challengeId}`, () => addChallengeProgress(challengeId, amount));
    };
    const cancel = (challenge) => {
        if (!window.confirm(`¿Cancelar el reto “${challenge.title}”?`)) return;
        runAction(`cancel-${challenge.id}`, () => cancelCommunityChallenge(challenge.id));
    };

    return (
        <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: 'Retos activos', value: totals.active, icon: <FiTarget />, color: 'bg-cyan-500/15 text-cyan-500' },
                    { label: 'Invitaciones', value: totals.invitations, icon: <FiUserPlus />, color: 'bg-amber-500/15 text-amber-500' },
                    { label: 'Finalizados', value: totals.completed, icon: <FiAward />, color: 'bg-purple-500/15 text-purple-500' }
                ].map((stat) => (
                    <div key={stat.label} className="glass-card flex items-center gap-4 !p-5">
                        <div className={`rounded-2xl p-3 text-xl ${stat.color}`}>{stat.icon}</div>
                        <div><p className="text-2xl font-black">{stat.value}</p><p className="text-xs font-bold text-textMuted">{stat.label}</p></div>
                    </div>
                ))}
            </section>

            <section className="glass-card !p-0 overflow-hidden">
                <button onClick={() => setShowCreate((value) => !value)} className="flex w-full items-center justify-between p-5 text-left">
                    <span className="flex items-center gap-3"><span className="rounded-xl bg-accent/15 p-2.5 text-accent"><FiPlus /></span><span><strong className="block text-lg font-black">Crear reto entre amigos</strong><small className="text-textMuted">Define una meta y compitan en tiempo real.</small></span></span>
                    {showCreate ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {showCreate && (
                    <form onSubmit={createChallenge} className="border-t border-gray-200 p-5 dark:border-white/10">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-black text-textMuted">Nombre del reto
                                <input required minLength="3" maxLength="80" value={form.title} onChange={(event) => updateForm('title', event.target.value)} className="input-field mt-2 text-sm" placeholder="Ej. 7 días de constancia" />
                            </label>
                            <label className="text-xs font-black text-textMuted">Descripción
                                <input maxLength="240" value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="input-field mt-2 text-sm" placeholder="¿En qué consiste?" />
                            </label>
                            <label className="text-xs font-black text-textMuted">Meta por persona
                                <input required type="number" min="1" max="10000" value={form.target} onChange={(event) => updateForm('target', event.target.value)} className="input-field mt-2 text-sm" />
                            </label>
                            <label className="text-xs font-black text-textMuted">Unidad
                                <input required maxLength="24" value={form.unit} onChange={(event) => updateForm('unit', event.target.value)} className="input-field mt-2 text-sm" placeholder="días, km, sesiones…" />
                            </label>
                            <label className="text-xs font-black text-textMuted">Fecha límite
                                <input required type="date" min={dateAfterDays(1)} max={dateAfterDays(365)} value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} className="input-field mt-2 text-sm" />
                            </label>
                        </div>

                        <div className="mt-5">
                            <p className="mb-3 text-xs font-black text-textMuted">Invita amigos (máximo 10)</p>
                            {!friends.length ? (
                                <p className="rounded-2xl bg-amber-500/10 p-4 text-sm font-bold text-amber-600 dark:text-amber-300">Necesitas aceptar al menos una amistad antes de crear un reto.</p>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {friends.map((friendship) => {
                                        const selected = form.friendIds.includes(friendship.user.id);
                                        return (
                                            <button key={friendship.id} type="button" onClick={() => toggleFriend(friendship.user.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${selected ? 'border-accent bg-accent/10' : 'border-gray-200 dark:border-white/10'}`}>
                                                <MiniAvatar user={friendship.user} />
                                                <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{friendship.user.nombre}</span>
                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${selected ? 'bg-accent text-gray-950' : 'bg-gray-200 text-transparent dark:bg-white/10'}`}><FiCheck size={13} /></span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={Boolean(actionKey) || !form.friendIds.length} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-black text-surface disabled:opacity-40 dark:bg-white dark:text-black">
                            <FiFlag /> {actionKey === 'create' ? 'Creando reto…' : 'Crear reto y enviar invitaciones'}
                        </button>
                    </form>
                )}
            </section>

            {challenges.invitations.length > 0 && (
                <section className="space-y-3">
                    <div><h2 className="text-2xl font-black">Invitaciones pendientes</h2><p className="text-sm text-textMuted">Tus amigos quieren competir contigo.</p></div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {challenges.invitations.map((challenge) => (
                            <article key={challenge.id} className="glass-card !p-5 border-amber-500/30">
                                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-amber-500">Invitación de {challenge.creator.nombre}</p><h3 className="mt-1 text-xl font-black">{challenge.title}</h3></div><FiClock className="text-amber-500" size={24} /></div>
                                {challenge.description && <p className="mt-2 text-sm text-textMuted">{challenge.description}</p>}
                                <p className="mt-4 text-xs font-bold text-textMuted">Meta: {challenge.target} {challenge.unit} · Hasta {formatDate(challenge.endDate)}</p>
                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <button onClick={() => respond(challenge.id, 'accept')} disabled={Boolean(actionKey)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-white disabled:opacity-50"><FiCheck /> Aceptar</button>
                                    <button onClick={() => respond(challenge.id, 'reject')} disabled={Boolean(actionKey)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-black text-red-500 disabled:opacity-50"><FiX /> Rechazar</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Retos activos</h2><p className="text-sm text-textMuted">Cada avance reorganiza la clasificación al instante.</p></div><button onClick={() => loadChallenges()} disabled={loading} className="rounded-xl p-3 text-textMuted hover:bg-gray-500/10"><FiRefreshCw className={loading ? 'animate-spin' : ''} /></button></div>
                {loading ? (
                    <div className="glass-card flex justify-center gap-2 text-sm font-bold text-textMuted"><FiRefreshCw className="animate-spin" /> Cargando retos…</div>
                ) : !challenges.active.length ? (
                    <div className="glass-card p-10 text-center"><FiTarget className="mx-auto mb-3 text-accent" size={34} /><h3 className="font-black">Aún no tienes retos activos</h3><p className="mt-2 text-sm text-textMuted">Crea uno o acepta la invitación de un amigo.</p></div>
                ) : challenges.active.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} actionKey={actionKey} progressAmount={progressAmounts[challenge.id] || 1} onAmountChange={(id, value) => setProgressAmounts((previous) => ({ ...previous, [id]: value }))} onProgress={registerProgress} onCancel={cancel} />
                ))}
            </section>

            {challenges.completed.length > 0 && (
                <section className="space-y-4"><div><h2 className="text-2xl font-black">Retos finalizados</h2><p className="text-sm text-textMuted">Consulta el resultado final.</p></div>{challenges.completed.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} actionKey={actionKey} progressAmount={1} onAmountChange={() => {}} onProgress={() => {}} onCancel={() => {}} completed />)}</section>
            )}
        </div>
    );
};

export default ChallengesPanel;
