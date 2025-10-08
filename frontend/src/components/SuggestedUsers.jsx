import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store.auth)
  if (!suggestedUsers?.length) {
    return (
      <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-5 text-sm text-[#6f6f6f] shadow-[0_14px_36px_-34px_rgba(200,169,241,0.6)]'>
        We are preparing fresh creators for you to follow. Check back soon!
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-5 shadow-[0_24px_50px_-42px_rgba(200,169,241,0.65)]'>
      <div className='flex items-center justify-between text-xs uppercase tracking-wide text-[#8c8c8c]'>
        <span className='font-semibold text-[#4a4a4a]'>Suggested for you</span>
        <button className='text-[#c8a9f1] transition hover:text-[#b897e9]'>See all</button>
      </div>
      <div className='mt-5 flex flex-col gap-4'>
        {suggestedUsers.map((user) => (
          <div key={user._id} className='flex items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.05)] bg-white/80 px-4 py-3 shadow-[0_12px_28px_-36px_rgba(0,0,0,0.45)]'>
            <div className='flex items-center gap-3'>
              <Link to={`/profile/${user?._id}`} className='rounded-2xl bg-gradient-to-br from-[#c8a9f1]/30 via-[#e8d6c6]/30 to-[#f8c8a3]/30 p-[2px]'>
                <Avatar className='h-10 w-10 border border-[rgba(0,0,0,0.05)] bg-white'>
                  <AvatarImage src={user?.profilePicture} alt='post_image' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col'>
                <h1 className='text-sm font-semibold text-[#333333]'>
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className='text-xs text-[#8c8c8c]'>{user?.bio || 'New to NovaSphere'}</span>
              </div>
            </div>
            <Button size='sm' className='rounded-full px-5'>Follow</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedUsers
