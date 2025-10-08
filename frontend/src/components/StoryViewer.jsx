import React, { useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateStoryViewers } from '@/redux/storySlice';

const StoryViewer = ({ story, open, onOpenChange }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const markViewed = async () => {
            if(!story?._id) return;
            try {
                await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/story/${story._id}/view`, {}, { withCredentials: true });
                dispatch(updateStoryViewers({ storyId: story._id, viewerId: user?._id }));
            } catch (error) {
                console.log(error);
            }
        };
        if(open){
            markViewed();
        }
    }, [dispatch, open, story?._id, user?._id]);

    if(!story) return null;

    const isImageStory = story.mediaType === 'image';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl p-0 overflow-hidden'>
                <div className='flex items-center justify-between px-4 py-2 bg-black text-white'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                            <AvatarImage src={story.owner?.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='text-sm font-semibold'>{story.owner?.username}</span>
                            <span className='text-xs text-gray-300'>{new Date(story.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <Button size='icon' variant='ghost' onClick={() => onOpenChange(false)}>
                        <X />
                    </Button>
                </div>
                <div className='bg-black flex justify-center items-center max-h-[80vh]'>
                    {
                        isImageStory ? (
                            <img src={story.mediaUrl} alt='story' className='max-h-[80vh] object-contain' />
                        ) : (
                            <video src={story.mediaUrl} controls autoPlay className='max-h-[80vh]' />
                        )
                    }
                </div>
                {story.caption && (
                    <div className='px-4 py-2 text-sm text-gray-700 bg-white'>
                        {story.caption}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StoryViewer;
