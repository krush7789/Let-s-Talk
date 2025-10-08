import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store.auth)
  if (!suggestedUsers?.length) {
    return (
      <div className='rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 text-sm text-slate-400'>
        We are preparing fresh creators for you to follow. Check back soon!
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5'>
      <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
        <span className='font-semibold text-slate-300'>Suggested for you</span>
        <button className='text-sky-300 transition hover:text-sky-200'>See all</button>
      </div>
      <div className='mt-5 flex flex-col gap-4'>
        {suggestedUsers.map((user) => (
          <div key={user._id} className='flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3'>
            <div className='flex items-center gap-3'>
              <Link to={`/profile/${user?._id}`} className='rounded-2xl bg-sky-500/20 p-[2px]'>
                <Avatar className='h-10 w-10 border border-slate-900'>
                  <AvatarImage src={user?.profilePicture} alt='post_image' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col'>
                <h1 className='text-sm font-semibold text-slate-100'>
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className='text-xs text-slate-400'>{user?.bio || 'New to NovaSphere'}</span>
              </div>
            </div>
            <Button size='sm' className='rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 hover:from-sky-400 hover:to-emerald-300'>Follow</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedUsers
