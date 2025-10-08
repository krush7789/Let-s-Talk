import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import useFollowRequests from '@/hooks/useFollowRequests'
import { toast } from 'sonner'

const FollowRequests = () => {
  const { followRequests } = useSelector(store => store.auth)
  const { respondToRequest } = useFollowRequests()

  const handleRespond = async (requesterId, action) => {
    try {
      const res = await respondToRequest({ requesterId, action })
      if (res?.success) {
        toast.success(res.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update request')
    }
  }

  if (!followRequests?.length) return null

  return (
    <div className='rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 shadow-inner shadow-sky-500/5'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-sm font-semibold text-slate-100'>Follow requests</h2>
        <span className='rounded-full bg-slate-900/70 px-2 py-0.5 text-xs text-slate-400'>{followRequests.length}</span>
      </div>
      <div className='flex flex-col gap-4'>
        {followRequests.map(request => (
          <div key={request._id} className='flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border border-slate-900'>
                <AvatarImage src={request.profilePicture} />
                <AvatarFallback>RQ</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-slate-100'>{request.username}</span>
                <span className='text-xs text-slate-400'>{request.bio || 'Wants to follow you'}</span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='sm' className='bg-emerald-400/90 text-slate-950 hover:bg-emerald-300' onClick={() => handleRespond(request._id, 'accept')}>
                Confirm
              </Button>
              <Button size='sm' variant='outline' className='border-slate-700/80 text-slate-300 hover:bg-slate-900/80' onClick={() => handleRespond(request._id, 'decline')}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FollowRequests
