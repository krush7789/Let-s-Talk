import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import FollowRequests from './FollowRequests';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <div className='w-80 my-4'>
      <div className='flex items-center gap-3 mb-6'>
        <Link to={`/profile/${user?._id}`} className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-sm'>{user?.username}</h1>
            <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
          </div>
        </Link>
      </div>
      <SuggestedUsers />
      <FollowRequests />
    </div>
  );
};

export default RightSidebar;

