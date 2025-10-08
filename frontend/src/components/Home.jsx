import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import useStoryFeed from '@/hooks/useStoryFeed'
import useReels from '@/hooks/useReels'

const Home = () => {
  useGetAllPost()
  useGetSuggestedUsers()
  useStoryFeed()
  useReels()

  return (
    <div className='flex w-full flex-col gap-6 lg:flex-row'>
      <div className='flex-1'>
        <Feed />
        <Outlet />
      </div>
      <div className='w-full lg:w-[320px] xl:w-[360px]'>
        <RightSidebar />
      </div>
    </div>
  )
}

export default Home
