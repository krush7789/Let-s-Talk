import React from 'react'
import Posts from './Posts'
import StoriesBar from './StoriesBar'
import ReelsShelf from './ReelsShelf'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col gap-6 items-center pl-[20%] pr-6'>
        <StoriesBar />
        <ReelsShelf />
        <Posts/>
    </div>
  )
}

export default Feed