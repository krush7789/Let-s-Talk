import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import StoryComposer from './StoryComposer';
import StoryViewer from './StoryViewer';

const StoryBubble = ({ story, label, onClick }) => {
    return (
        <button onClick={() => onClick(story)} className='flex flex-col items-center gap-2 focus:outline-none'>
            <div className='p-[2px] bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 rounded-full'>
                <Avatar className='h-16 w-16 border-4 border-white'>
                    <AvatarImage src={story?.owner?.profilePicture} alt={story?.owner?.username} />
                    <AvatarFallback>ST</AvatarFallback>
                </Avatar>
            </div>
            <span className='text-xs font-medium text-slate-500'>{label}</span>
        </button>
    );
};

const StoriesBar = () => {
    const { myStories, stories, isLoading } = useSelector(store => store.story);
    const { user } = useSelector(store => store.auth);
    const [activeStory, setActiveStory] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);

    const orderedStories = useMemo(() => {
        return [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [stories]);

    const openStory = (story) => {
        if(!story) return;
        setActiveStory(story);
        setViewerOpen(true);
    };

    return (
        <div className='w-full rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_25px_80px_-60px_rgba(30,64,175,0.55)] backdrop-blur'>
            <div className='flex items-center justify-between mb-3 gap-3'>
                <div>
                    <h2 className='font-semibold text-base text-slate-900'>Stories</h2>
                    <p className='text-xs text-slate-500'>Share moments that glow for a day.</p>
                </div>
                <div className='w-40'>
                    <StoryComposer />
                </div>
            </div>
            {
                isLoading ? (
                    <div className='text-sm text-gray-500 py-6 text-center'>Loading stories...</div>
                ) : (
                    <div className='flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-200/70 scrollbar-track-transparent'>
                        {
                            myStories.length > 0 ? (
                                myStories.map((story) => (
                                    <StoryBubble
                                        key={story._id}
                                        story={story}
                                        label='Your story'
                                        onClick={openStory}
                                    />
                                ))
                            ) : (
                                <div className='flex flex-col items-center justify-center text-xs text-slate-500'>
                                    <Avatar className='h-16 w-16 mb-1'>
                                        <AvatarImage src={user?.profilePicture} />
                                        <AvatarFallback>YOU</AvatarFallback>
                                    </Avatar>
                                    <span>Create a story to share</span>
                                </div>
                            )
                        }
                        {
                            orderedStories.map((story) => (
                                <StoryBubble
                                    key={story._id}
                                    story={story}
                                    label={story.owner?.username}
                                    onClick={openStory}
                                />
                            ))
                        }
                    </div>
                )
            }
            <StoryViewer story={activeStory} open={viewerOpen} onOpenChange={setViewerOpen} />
        </div>
    );
};

export default StoriesBar;
