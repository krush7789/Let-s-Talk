import React from 'react';
import Posts from './Posts';
import StoriesBar from './StoriesBar';
import ReelsShelf from './ReelsShelf';

const Feed = () => {
  return (
    <div className='flex flex-col gap-6'>
      <StoriesBar />
      <ReelsShelf />
      <Posts />
    </div>
  );
};

export default Feed;

