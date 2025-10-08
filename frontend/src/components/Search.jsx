import React, { useEffect, useMemo, useState } from 'react';
import { Input } from './ui/input';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Search = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
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
                    axios.get(`https://let-s-talk-lq7h.onrender.com/api/v1/user/search`, {
                        params: { q: debouncedQuery },
                        withCredentials: true
                    }),
                    axios.get(`https://let-s-talk-lq7h.onrender.com/api/v1/post/search`, {
                        params: { q: debouncedQuery },
                        withCredentials: true
                    })
                ]);

                if (userRes.data.success) {
                    setUsers(userRes.data.users);
                }
                if (postRes.data.success) {
                    setPosts(postRes.data.posts);
                }
            } catch (error) {
                console.log(error);
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
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
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
        <div className='px-10 py-10 w-full min-h-screen'>
            <div className='max-w-3xl mx-auto flex flex-col gap-10'>
                <div>
                    <h1 className='text-2xl font-semibold mb-3'>Search</h1>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Search for people or tags'
                        className='bg-white'
                    />
                </div>

                {loading && (
                    <div className='text-center text-sm text-gray-500'>Searching...</div>
                )}

                {!loading && debouncedQuery && (
                    <div className='flex flex-col gap-12'>
                        <section>
                            <h2 className='text-lg font-semibold mb-4'>Accounts</h2>
                            {
                                users.length === 0 ? (
                                    <p className='text-sm text-gray-500'>No accounts found.</p>
                                ) : (
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {users.map(result => (
                                            <button
                                                key={result._id}
                                                onClick={() => navigate(`/profile/${result._id}`)}
                                                className='flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 text-left hover:shadow-sm transition'
                                            >
                                                <Avatar>
                                                    <AvatarImage src={result.profilePicture} />
                                                    <AvatarFallback>{result.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className='font-semibold text-sm'>{result.username}</p>
                                                    {result._id === user?._id && (
                                                        <span className='text-xs text-gray-500'>This is you</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            }
                        </section>

                        <section>
                            <h2 className='text-lg font-semibold mb-4'>Tags</h2>
                            {
                                matchingTags.length === 0 ? (
                                    <p className='text-sm text-gray-500'>No matching tags.</p>
                                ) : (
                                    <div className='flex flex-wrap gap-3'>
                                        {matchingTags.map(({ tag, count }) => (
                                            <button
                                                key={tag}
                                                onClick={() => navigate(`/tags/${tag}`)}
                                                className='px-4 py-2 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-100 transition'
                                            >
                                                #{tag} <span className='text-gray-500 ml-2 text-xs'>{count} posts</span>
                                            </button>
                                        ))}
                                    </div>
                                )
                            }
                        </section>

                        <section>
                            <h2 className='text-lg font-semibold mb-4'>Posts</h2>
                            {
                                posts.length === 0 ? (
                                    <p className='text-sm text-gray-500'>No posts found.</p>
                                ) : (
                                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                        {posts.map(post => (
                                            <div key={post._id} className='aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white'>
                                                <img src={post.image} alt={post.caption} className='w-full h-full object-cover' />
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;

