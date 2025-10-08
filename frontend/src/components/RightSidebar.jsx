import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'
import FollowRequests from './FollowRequests'
import { Sparkles } from 'lucide-react'

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth)
  return (
    <div className='sticky top-24 flex flex-col gap-6 rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white/75 p-6 text-[#4a4a4a] shadow-[0_30px_70px_-50px_rgba(51,51,51,0.65)] backdrop-blur-xl'>
      <div className='flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white/85 p-4 shadow-[0_18px_40px_-38px_rgba(200,169,241,0.6)]'>
        <Link to={`/profile/${user?._id}`} className='rounded-2xl bg-gradient-to-br from-[#c8a9f1]/30 via-[#e8d6c6]/40 to-[#f8c8a3]/30 p-[2px]'>
          <Avatar className='h-12 w-12 border border-[rgba(0,0,0,0.05)] bg-white'>
            <AvatarImage src={user?.profilePicture} alt='post_image' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col'>
          <h1 className='text-sm font-semibold text-[#333333]'>
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className='text-xs text-[#6f6f6f]'>{user?.bio || 'Share a glimpse of your world today.'}</span>
        </div>
      </div>
      <div className='rounded-2xl border border-[rgba(0,0,0,0.04)] bg-gradient-to-br from-[#fbf7ff] via-white to-[#fff5ed] p-5 text-xs text-[#4a4a4a] shadow-[0_22px_45px_-40px_rgba(200,169,241,0.6)]'>
        <div className='flex items-start gap-3'>
          <span className='rounded-2xl bg-[#c8a9f1]/20 p-2 text-[#c8a9f1]'>
            <Sparkles className='h-4 w-4' />
          </span>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-[#333333]'>Creator cues</p>
            <p>Drop a reel or story to stay on top of the community radar.</p>
          </div>
        </div>
      </div>
      <SuggestedUsers />
      <FollowRequests />
    </div>
  )
}

export default RightSidebar
