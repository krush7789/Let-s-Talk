import Posts from './Posts'
import StoriesBar from './StoriesBar'
import ReelsShelf from './ReelsShelf'

const Feed = () => {
  return (
    <div className='flex w-full flex-col items-center gap-6'>
      <div className='flex w-full max-w-2xl flex-col gap-6'>
        <StoriesBar />
        <ReelsShelf />
        <Posts />
      </div>
    </div>
  )
}

export default Feed
