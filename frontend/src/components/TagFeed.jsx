import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '@/lib/apiClient';

const TagFeed = () => {
    const { tag } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const normalizedTag = tag?.toLowerCase();
    const displayTag = normalizedTag || tag || '';

    useEffect(() => {
        const fetchTagPosts = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/post/tags/${normalizedTag}`);
                if (res.data.success) {
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.error(error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        if (normalizedTag) {
            fetchTagPosts();
        }
    }, [normalizedTag]);

    return (
        <div className='px-10 py-10 min-h-screen'>
            <div className='max-w-4xl mx-auto flex flex-col gap-10'>
                <header>
                    <h1 className='text-2xl font-semibold mb-2'>#{displayTag}</h1>
                    <p className='text-gray-500 text-sm'>Showing posts tagged with #{displayTag}.</p>
                </header>

                {loading ? (
                    <div className='text-center text-sm text-gray-500'>Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className='text-center text-sm text-gray-500'>No posts found for this tag.</div>
                ) : (
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                        {posts.map(post => (
                            <div key={post._id} className='aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white'>
                                <img src={post.image} alt={post.caption} className='w-full h-full object-cover' />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagFeed;

