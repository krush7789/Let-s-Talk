import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, Play } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '@/lib/apiClient';
import { toggleReelLike } from '@/redux/reelSlice';

const ReelCard = ({ reel }) => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [viewed, setViewed] = useState(reel.views?.includes(user?._id));
    const [likeLoading, setLikeLoading] = useState(false);
    const isLiked = reel.likes?.includes(user?._id);

    const toggleLike = async () => {
        if(!user?._id) return;
        try {
            setLikeLoading(true);
            if(isLiked){
                await apiClient.post(`/reel/${reel._id}/unlike`, {});
                dispatch(toggleReelLike({ reelId: reel._id, userId: user._id, liked: false }));
            }else{
                await apiClient.post(`/reel/${reel._id}/like`, {});
                dispatch(toggleReelLike({ reelId: reel._id, userId: user._id, liked: true }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLikeLoading(false);
        }
    };

    const markView = async () => {
        if(viewed || !user?._id) return;
        try {
            setViewed(true);
            await apiClient.post(`/reel/${reel._id}/view`, {});
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
            <div className='flex items-center gap-3 px-4 py-3'>
                <Avatar>
                    <AvatarImage src={reel.author?.profilePicture} />
                    <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                    <span className='text-sm font-semibold'>{reel.author?.username}</span>
                    <span className='text-xs text-gray-500'>{new Date(reel.createdAt).toLocaleString()}</span>
                </div>
            </div>
            <div className='relative bg-black'>
                <video
                    src={reel.videoUrl}
                    controls
                    playsInline
                    className='w-full max-h-[480px] object-contain bg-black'
                    onPlay={markView}
                />
                <div className='absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full'>
                    <Play size={14} />
                    <span>{reel.views?.length || 0} views</span>
                </div>
            </div>
            <div className='p-4 flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                    <Button variant={isLiked ? 'default' : 'outline'} size='sm' onClick={toggleLike} disabled={likeLoading}>
                        <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <span className='text-xs text-gray-500'>{reel.likes?.length || 0} likes</span>
                </div>
                {reel.caption && (
                    <p className='text-sm text-gray-700'>
                        <span className='font-semibold mr-2'>{reel.author?.username}</span>
                        {reel.caption}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReelCard;
