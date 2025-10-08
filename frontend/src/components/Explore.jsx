import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExplore = async () => {
            try {
                setLoading(true);
                const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/post/explore', { withCredentials: true });
                if (res.data.success) {
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchExplore();
    }, []);

    const trendingTags = useMemo(() => {
        const counts = new Map();
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            });
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag, count]) => ({ tag, count }));
    }, [posts]);

    return (
        <div className='px-10 py-10 min-h-screen'>
            <div className='max-w-6xl mx-auto flex flex-col gap-10'>
                <header className='flex flex-col gap-4'>
                    <h1 className='text-2xl font-semibold'>Explore</h1>
                    {
                        trendingTags.length > 0 && (
                            <div className='flex flex-wrap gap-3'>
                                {trendingTags.map(({ tag, count }) => (
                                    <Button
                                        key={tag}
                                        variant='outline'
                                        className='rounded-full text-sm'
                                        onClick={() => navigate(`/tags/${tag}`)}
                                    >
                                        #{tag} · {count}
                                    </Button>
                                ))}
                            </div>
                        )
                    }
                </header>

                {loading ? (
                    <div className='text-center text-sm text-gray-500'>Loading explore posts...</div>
                ) : posts.length === 0 ? (
                    <div className='text-center text-sm text-gray-500'>No posts available yet.</div>
                ) : (
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {posts.map(post => (
                            <div key={post._id} className='group relative overflow-hidden rounded-2xl bg-white shadow-sm'>
                                <img src={post.image} alt={post.caption} className='w-full h-full object-cover aspect-square transition group-hover:scale-105 duration-500' />
                                <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-end p-4'>
                                    <div>
                                        <p className='text-white text-sm font-medium line-clamp-2'>{post.caption}</p>
                                        <p className='text-white/80 text-xs mt-1'>{post.likes?.length || 0} likes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;

