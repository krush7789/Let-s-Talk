import React from 'react';
import Feed from './Feed';
import RightSidebar from './RightSidebar';
import useGetAllPost from '@/hooks/useGetAllPost';
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers';
import useStoryFeed from '@/hooks/useStoryFeed';
import useReels from '@/hooks/useReels';

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    useStoryFeed();
    useReels();

    return (
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start'>
            <div className='flex-1 space-y-8'>
                <Feed />
            </div>
            <RightSidebar />
        </div>
    );
};

export default Home;
