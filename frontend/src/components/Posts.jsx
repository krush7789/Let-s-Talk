import React from 'react';
import Post from './Post';
import { useSelector } from 'react-redux';

const Posts = () => {
  const { posts } = useSelector((store) => store.post);
  if (!posts?.length) {
    return (
      <div className='rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-10 text-center text-sm text-slate-500 shadow-inner'>
        Follow more friends or share something new to fill your feed.
      </div>
    );
  }
  return (
    <div className='flex flex-col gap-6'>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
