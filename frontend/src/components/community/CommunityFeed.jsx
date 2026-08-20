import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FiAward, FiChevronDown, FiGlobe, FiHeart, FiMessageCircle,
    FiRefreshCw, FiSend, FiShield, FiTrash2, FiUsers, FiX, FiZap
} from 'react-icons/fi';
import { initSocket } from '../../services/socket';
import {
    createCommunityComment,
    createCommunityPost,
    deleteCommunityComment,
    deleteCommunityPost,
    getCommunityFeed,
    reactToCommunityPost
} from '../../services/communityService';

const REACTIONS = [
    { type: 'SUPPORT', label: 'Apoyo', icon: FiHeart, active: 'text-rose-500 bg-rose-500/10' },
    { type: 'FIRE', label: 'Impulso', icon: FiZap, active: 'text-amber-500 bg-amber-500/10' },
    { type: 'APPLAUSE', label: 'Aplausos', icon: FiAward, active: 'text-cyan-500 bg-cyan-500/10' }
];

const formatTime = (value) => {
    const date = new Date(value);
    const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
    const formatter = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });
    if (seconds < 60) return formatter.format(-seconds, 'second');
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return formatter.format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (hours < 24) return formatter.format(-hours, 'hour');
    const days = Math.round(hours / 24);
    if (days < 7) return formatter.format(-days, 'day');
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const Avatar = ({ user, small = false }) => (
    <div className={`relative shrink-0 ${small ? 'h-8 w-8' : 'h-11 w-11'}`}>
        {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.nombre} className="h-full w-full rounded-xl object-cover" />
        ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white">
                {user.nombre?.charAt(0)?.toUpperCase()}
            </div>
        )}
        {typeof user.online === 'boolean' && (
            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${user.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        )}
    </div>
);

const Comment = ({ comment, postId, actionKey, onDelete }) => (
    <div className="group flex items-start gap-2.5">
        <Avatar user={comment.author} small />
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-gray-100 px-3.5 py-2.5 dark:bg-white/[0.06]">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-black text-textPrimary">{comment.author.nombre}</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-textPrimary">{comment.content}</p>
                </div>
                {comment.canDelete && (
                    <button onClick={() => onDelete(postId, comment.id)} disabled={Boolean(actionKey)} className="p-1 text-textMuted opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 focus:opacity-100" title="Eliminar comentario">
                        <FiX size={13} />
                    </button>
                )}
            </div>
            <p className="mt-1 text-[10px] font-bold text-textMuted">{formatTime(comment.createdAt)}</p>
        </div>
    </div>
);

const CommunityFeed = ({ currentUser, showNotice }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('FRIENDS');
    const [actionKey, setActionKey] = useState(null);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [expandedComments, setExpandedComments] = useState({});

    const loadFeed = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const response = await getCommunityFeed();
            setPosts(response.data.posts);
        } catch (error) {
            showNotice(error.message, 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [showNotice]);

    useEffect(() => {
        const socket = initSocket();
        const onFeedChanged = () => loadFeed({ silent: true });
        const onPresenceChanged = ({ userId, online }) => {
            setPosts((previous) => previous.map((post) => (
                post.author.id === Number(userId)
                    ? { ...post, author: { ...post.author, online } }
                    : post
            )));
        };
        const initialLoad = window.setTimeout(() => loadFeed(), 0);
        socket.on('community:feed_changed', onFeedChanged);
        socket.on('community:state_changed', onFeedChanged);
        socket.on('community:presence_changed', onPresenceChanged);
        return () => {
            window.clearTimeout(initialLoad);
            socket.off('community:feed_changed', onFeedChanged);
            socket.off('community:state_changed', onFeedChanged);
            socket.off('community:presence_changed', onPresenceChanged);
        };
    }, [loadFeed]);

    const totalReactions = useMemo(
        () => posts.reduce((total, post) => total + Object.values(post.reactions).reduce((sum, count) => sum + count, 0), 0),
        [posts]
    );

    const runAction = async (key, action, { quiet = false } = {}) => {
        setActionKey(key);
        try {
            const response = await action();
            if (!quiet) showNotice(response.message);
            await loadFeed({ silent: true });
            return true;
        } catch (error) {
            showNotice(error.message, 'error');
            return false;
        } finally {
            setActionKey(null);
        }
    };

    const publish = async (event) => {
        event.preventDefault();
        const created = await runAction('publish', () => createCommunityPost(content, visibility));
        if (created) setContent('');
    };

    const removePost = (post) => {
        if (!window.confirm('¿Eliminar esta publicación del muro?')) return;
        runAction(`delete-post-${post.id}`, () => deleteCommunityPost(post.id));
    };

    const react = (postId, type) => runAction(
        `react-${postId}-${type}`,
        () => reactToCommunityPost(postId, type),
        { quiet: true }
    );

    const sendComment = async (event, postId) => {
        event.preventDefault();
        const draft = commentDrafts[postId] || '';
        const created = await runAction(`comment-${postId}`, () => createCommunityComment(postId, draft), { quiet: true });
        if (created) {
            setCommentDrafts((previous) => ({ ...previous, [postId]: '' }));
            setExpandedComments((previous) => ({ ...previous, [postId]: true }));
        }
    };

    const removeComment = (postId, commentId) => runAction(
        `delete-comment-${commentId}`,
        () => deleteCommunityComment(commentId),
        { quiet: true }
    ).then(() => setExpandedComments((previous) => ({ ...previous, [postId]: true })));

    return (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
                <form onSubmit={publish} className="glass-card !p-0 overflow-hidden">
                    <div className="flex items-start gap-3 p-5">
                        <Avatar user={{ ...currentUser, online: true }} />
                        <div className="min-w-0 flex-1">
                            <textarea
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                maxLength="600"
                                rows="3"
                                placeholder={`¿Qué avance quieres compartir, ${currentUser.nombre}?`}
                                className="w-full resize-none bg-transparent text-base text-textPrimary outline-none placeholder:text-textMuted"
                            />
                            <div className="mt-2 text-right text-[10px] font-bold text-textMuted">{content.length}/600</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-500/[0.03] px-5 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-2 text-xs font-black text-textMuted">
                            {visibility === 'FRIENDS' ? <FiUsers /> : <FiGlobe />}
                            <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className="rounded-xl border border-gray-200 bg-surface px-3 py-2 text-xs font-bold text-textPrimary outline-none dark:border-white/10">
                                <option value="FRIENDS">Solo amigos</option>
                                <option value="PUBLIC">Toda la comunidad</option>
                            </select>
                        </label>
                        <button type="submit" disabled={!content.trim() || Boolean(actionKey)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-black text-surface disabled:opacity-40 dark:bg-white dark:text-black">
                            <FiSend /> {actionKey === 'publish' ? 'Publicando…' : 'Publicar'}
                        </button>
                    </div>
                </form>

                {loading ? (
                    <div className="glass-card flex items-center justify-center gap-2 py-12 text-sm font-bold text-textMuted"><FiRefreshCw className="animate-spin" /> Cargando muro…</div>
                ) : posts.length === 0 ? (
                    <div className="glass-card py-14 text-center"><FiMessageCircle className="mx-auto mb-3 text-accent" size={36} /><h3 className="font-black">El muro está esperando su primera historia</h3><p className="mt-2 text-sm text-textMuted">Comparte un avance breve con tus amigos.</p></div>
                ) : posts.map((post) => {
                    const isExpanded = expandedComments[post.id];
                    const visibleComments = isExpanded ? post.comments : post.comments.slice(-2);
                    const hiddenComments = post.comments.length - visibleComments.length;
                    return (
                        <article key={post.id} className="glass-card !p-0 overflow-hidden">
                            <header className="flex items-start gap-3 p-5 pb-3">
                                <Avatar user={post.author} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2"><p className="truncate text-sm font-black text-textPrimary">{post.author.nombre}</p>{post.author.is_premium && <FiAward className="text-amber-500" title="Premium" />}</div>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-textMuted">
                                        <span title={new Date(post.createdAt).toLocaleString('es-MX')}>{formatTime(post.createdAt)}</span><span>·</span>{post.visibility === 'FRIENDS' ? <><FiUsers /> Amigos</> : <><FiGlobe /> Comunidad</>}
                                    </div>
                                </div>
                                {post.isMine && <button onClick={() => removePost(post)} disabled={Boolean(actionKey)} className="rounded-xl p-2 text-textMuted hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40" title="Eliminar publicación"><FiTrash2 /></button>}
                            </header>

                            <p className="whitespace-pre-wrap break-words px-5 pb-5 text-[15px] leading-6 text-textPrimary">{post.content}</p>

                            <div className="mx-5 flex items-center justify-between border-t border-gray-100 py-2.5 text-[11px] font-bold text-textMuted dark:border-white/5">
                                <span>{Object.values(post.reactions).reduce((sum, count) => sum + count, 0)} reacciones</span>
                                <button onClick={() => setExpandedComments((previous) => ({ ...previous, [post.id]: true }))} className="hover:text-textPrimary">{post.comments.length} comentarios</button>
                            </div>

                            <div className="grid grid-cols-3 gap-1 border-y border-gray-100 px-3 py-1.5 dark:border-white/5">
                                {REACTIONS.map((reaction) => {
                                    const Icon = reaction.icon;
                                    const selected = post.myReaction === reaction.type;
                                    return (
                                        <button key={reaction.type} onClick={() => react(post.id, reaction.type)} disabled={Boolean(actionKey)} className={`inline-flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-black transition-colors disabled:opacity-50 ${selected ? reaction.active : 'text-textMuted hover:bg-gray-500/10 hover:text-textPrimary'}`}>
                                            <Icon /> <span className="hidden sm:inline">{reaction.label}</span>{post.reactions[reaction.type] > 0 && <span>{post.reactions[reaction.type]}</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 p-5">
                                {hiddenComments > 0 && <button onClick={() => setExpandedComments((previous) => ({ ...previous, [post.id]: true }))} className="inline-flex items-center gap-1 text-xs font-black text-textMuted hover:text-textPrimary"><FiChevronDown /> Ver {hiddenComments} comentarios anteriores</button>}
                                {visibleComments.map((comment) => <Comment key={comment.id} comment={comment} postId={post.id} actionKey={actionKey} onDelete={removeComment} />)}
                                <form onSubmit={(event) => sendComment(event, post.id)} className="flex items-center gap-2 pt-1">
                                    <Avatar user={currentUser} small />
                                    <div className="flex min-w-0 flex-1 items-center rounded-full border border-gray-200 bg-gray-500/5 px-4 dark:border-white/10">
                                        <input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((previous) => ({ ...previous, [post.id]: event.target.value }))} maxLength="300" placeholder="Escribe un comentario…" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-textPrimary outline-none" />
                                        <button type="submit" disabled={!commentDrafts[post.id]?.trim() || Boolean(actionKey)} className="p-2 text-accent disabled:opacity-30" title="Comentar"><FiSend /></button>
                                    </div>
                                </form>
                            </div>
                        </article>
                    );
                })}
            </div>

            <aside className="sticky top-6 hidden space-y-4 xl:block">
                <div className="glass-card !p-5">
                    <div className="mb-3 flex items-center gap-2"><FiShield className="text-emerald-500" /><h3 className="text-sm font-black">Un muro saludable</h3></div>
                    <ul className="space-y-2 text-xs leading-5 text-textMuted"><li>Comparte avances reales.</li><li>Apoya sin comparar negativamente.</li><li>Respeta la privacidad de tus amigos.</li></ul>
                </div>
                <div className="glass-card !p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-textMuted">Actividad visible</p>
                    <p className="mt-2 text-3xl font-black text-textPrimary">{posts.length}</p>
                    <p className="text-xs text-textMuted">publicaciones recientes</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-accent"><FiHeart /> {totalReactions} reacciones</div>
                </div>
                <button onClick={() => loadFeed()} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-surface px-4 py-3 text-xs font-black text-textPrimary hover:border-accent dark:border-white/10"><FiRefreshCw className={loading ? 'animate-spin' : ''} /> Actualizar muro</button>
            </aside>
        </div>
    );
};

export default CommunityFeed;
