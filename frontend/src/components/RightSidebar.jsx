import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'
import FollowRequests from './FollowRequests'
import { Sparkles } from 'lucide-react'

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth)
  return (
    <div className='sticky top-24 flex flex-col gap-6 rounded-[2.5rem] border border-slate-800/60 bg-slate-900/60 p-6 text-slate-100 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <div className='flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4'>
        <Link to={`/profile/${user?._id}`} className='rounded-2xl bg-gradient-to-br from-emerald-400/40 via-sky-500/30 to-indigo-500/20 p-[2px]'>
          <Avatar className='h-12 w-12 border border-slate-900'>
            <AvatarImage src={user?.profilePicture} alt='post_image' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col'>
          <h1 className='text-sm font-semibold text-slate-100'>
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className='text-xs text-slate-400'>{user?.bio || 'Share a glimpse of your world today.'}</span>
        </div>
      </div>
      <div className='rounded-2xl border border-slate-800/60 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-400/10 p-5 text-xs text-slate-200 shadow-inner shadow-sky-500/10'>
        <div className='flex items-start gap-3'>
          <span className='rounded-2xl bg-slate-950/60 p-2 text-emerald-300'>
            <Sparkles className='h-4 w-4' />
          </span>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-slate-100'>Creator cues</p>
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
