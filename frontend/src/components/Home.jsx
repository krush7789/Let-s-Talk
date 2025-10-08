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
        <div className='flex gap-6 px-10 pt-10'>
            <div className='flex-1 max-w-2xl'>
                <Feed />
            </div>
            <RightSidebar />
        </div>
    );
};

export default Home;

