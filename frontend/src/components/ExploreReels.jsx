import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ExploreReels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                setLoading(true);
                const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/reel/explore', { withCredentials: true });
                if (res.data.success) {
                    setReels(res.data.reels);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    return (
        <div className='px-10 py-10 min-h-screen'>
            <div className='max-w-4xl mx-auto flex flex-col gap-8'>
                <header>
                    <h1 className='text-2xl font-semibold mb-2'>Reels</h1>
                    <p className='text-gray-500 text-sm'>Watch trending short videos from across the community.</p>
                </header>

                {loading ? (
                    <div className='text-center text-sm text-gray-500'>Loading reels...</div>
                ) : reels.length === 0 ? (
                    <div className='text-center text-sm text-gray-500'>No reels available yet.</div>
                ) : (
                    <div className='flex flex-col gap-8'>
                        {reels.map(reel => (
                            <div key={reel._id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
                                <div className='p-4 flex items-center gap-3'>
                                    <Avatar className='w-10 h-10'>
                                        <AvatarImage src={reel.author?.profilePicture} />
                                        <AvatarFallback>{reel.author?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-semibold text-sm'>{reel.author?.username}</span>
                                        <span className='text-xs text-gray-500'>{new Date(reel.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className='bg-black'>
                                    <video src={reel.videoUrl} controls playsInline className='w-full max-h-[520px] object-contain bg-black' />
                                </div>
                                {reel.caption && (
                                    <div className='p-4 text-sm text-gray-700'>
                                        {reel.caption}
                                    </div>
                                )}
                                <div className='px-4 pb-4 text-xs text-gray-500 flex gap-4'>
                                    <span>{reel.likes?.length || 0} likes</span>
                                    <span>{reel.views?.length || 0} views</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreReels;

