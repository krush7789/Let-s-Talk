import React, { useEffect, useMemo, useState } from 'react';
import { Input } from './ui/input';
import apiClient from '@/lib/apiClient';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const navigate = useNavigate();
    const { user } = useSelector((store) => store.auth);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 400);

        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery) {
                setUsers([]);
                setPosts([]);
                return;
            }
            try {
                setLoading(true);
                const [userRes, postRes] = await Promise.all([
                    apiClient.get('/user/search', {
                        params: { q: debouncedQuery },
                    }),
                    apiClient.get('/post/search', {
                        params: { q: debouncedQuery },
                    }),
                ]);

                if (userRes.data.success) {
                    setUsers(userRes.data.users);
                }
                if (postRes.data.success) {
                    setPosts(postRes.data.posts);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const matchingTags = useMemo(() => {
        if (!debouncedQuery) return [];
        const queryLower = debouncedQuery.toLowerCase();
        const counts = new Map();
        posts.forEach((post) => {
            (post.tags || []).forEach((tag) => {
                if (tag.includes(queryLower)) {
                    counts.set(tag, (counts.get(tag) || 0) + 1);
                }
            });
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }, [posts, debouncedQuery]);

    return (
        <div className='mx-auto w-full max-w-5xl rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-55px_rgba(30,64,175,0.45)] backdrop-blur'>
            <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4'>
                <SearchIcon className='h-5 w-5 text-indigo-400' />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Search for people, tags, or stories'
                    className='border-none bg-transparent text-sm focus-visible:ring-0'
                />
            </div>

            {loading && (
                <div className='mt-6 flex items-center justify-center gap-2 text-sm text-slate-500'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Searching the network…
                </div>
            )}

            {!loading && debouncedQuery && (
                <div className='mt-8 flex flex-col gap-10'>
                    <section className='space-y-3'>
                        <h2 className='text-sm font-semibold text-slate-900'>Accounts</h2>
                        {users.length === 0 ? (
                            <p className='text-sm text-slate-500'>No accounts match “{debouncedQuery}”.</p>
                        ) : (
                            <div className='grid gap-4 md:grid-cols-2'>
                                {users.map((result) => (
                                    <button
                                        key={result._id}
                                        onClick={() => navigate(`/profile/${result._id}`)}
                                        className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md'
                                    >
                                        <Avatar className='h-11 w-11 border border-indigo-100'>
                                            <AvatarImage src={result.profilePicture} />
                                            <AvatarFallback>{result.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col'>
                                            <span className='text-sm font-semibold text-slate-900'>{result.username}</span>
                                            {result._id === user?._id && (
                                                <span className='text-xs text-indigo-500'>This is you</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className='space-y-3'>
                        <h2 className='text-sm font-semibold text-slate-900'>Tags</h2>
                        {matchingTags.length === 0 ? (
                            <p className='text-sm text-slate-500'>No matching tags yet.</p>
                        ) : (
                            <div className='flex flex-wrap gap-3'>
                                {matchingTags.map(({ tag, count }) => (
                                    <button
                                        key={tag}
                                        onClick={() => navigate(`/tags/${tag}`)}
                                        className='rounded-full border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100'
                                    >
                                        #{tag} <span className='ml-2 text-[11px] text-indigo-400'>{count} posts</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className='space-y-3'>
                        <h2 className='text-sm font-semibold text-slate-900'>Posts</h2>
                        {posts.length === 0 ? (
                            <p className='text-sm text-slate-500'>No visual stories found.</p>
                        ) : (
                            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                                {posts.map((post) => (
                                    <div
                                        key={post._id}
                                        onClick={() => navigate(`/profile/${post.author?._id || post.author}`)}
                                        className='group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 transition hover:border-indigo-200 hover:shadow-lg'
                                    >
                                        <img src={post.image} alt={post.caption} className='h-full w-full object-cover transition duration-300 group-hover:scale-105' />
                                        <div className='absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/50 via-transparent to-transparent p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                                            <p className='line-clamp-2'>{post.caption}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Search;
