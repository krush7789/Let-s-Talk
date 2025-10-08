import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import useStoryFeed from '@/hooks/useStoryFeed'
import useReels from '@/hooks/useReels'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    useStoryFeed();
    useReels();
    return (
        <div className='flex'>
            <div className='flex-grow'>
                <Feed />
                <Outlet />
            </div>
            <RightSidebar />
        </div>
    )
}

export default Home