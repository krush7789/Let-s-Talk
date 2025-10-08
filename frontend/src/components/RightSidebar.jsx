import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import FollowRequests from './FollowRequests';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <aside className='sticky top-28 hidden w-full space-y-6 lg:block lg:w-80'>
      <div className='rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_-35px_rgba(30,64,175,0.45)] backdrop-blur'>
        <Link to={`/profile/${user?._id}`} className='flex items-center gap-3'>
          <Avatar className='h-12 w-12 border border-indigo-100'>
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-sm font-semibold text-slate-900'>{user?.username}</h1>
            <span className='text-xs text-slate-500'>{user?.bio || 'Craft a short bio so people know you.'}</span>
          </div>
        </Link>
      </div>
      <SuggestedUsers />
      <FollowRequests />
    </aside>
  );
};

export default RightSidebar;
