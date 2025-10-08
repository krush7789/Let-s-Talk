import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'
import FollowRequests from './FollowRequests'
import { Sparkles } from 'lucide-react'

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth)
  return (
    <div className='sticky top-24 flex flex-col gap-5 rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface-raised)] p-5 text-[var(--color-text-muted)] shadow-[0_18px_34px_rgba(0,0,0,0.08)]'>
      <div className='flex items-center gap-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] px-4 py-3'>
        <Link to={`/profile/${user?._id}`} className='flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-primary-start)]/15'>
          <Avatar className='h-10 w-10 border border-[var(--color-outline)] bg-[var(--color-surface-raised)]'>
            <AvatarImage src={user?.profilePicture} alt='post_image' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col'>
          <h1 className='text-sm font-semibold text-[var(--color-text)]'>
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className='text-xs text-[var(--color-text-muted)]'>{user?.bio || 'Share a glimpse of your world today.'}</span>
        </div>
      </div>
      <div className='rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 text-xs text-[var(--color-text-muted)]'>
        <div className='flex items-start gap-3'>
          <span className='flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary-start)]/15 text-[var(--color-primary-start)]'>
            <Sparkles className='h-4 w-4' />
          </span>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-[var(--color-text)]'>Creator cues</p>
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
