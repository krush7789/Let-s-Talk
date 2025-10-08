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
    <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-5 shadow-[0_22px_45px_-42px_rgba(200,169,241,0.6)]'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-sm font-semibold text-[#333333]'>Follow requests</h2>
        <span className='rounded-full bg-[#f0e9ff] px-2 py-0.5 text-xs text-[#6f6f6f]'>{followRequests.length}</span>
      </div>
      <div className='flex flex-col gap-4'>
        {followRequests.map(request => (
          <div key={request._id} className='flex items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.05)] bg-white/80 px-4 py-3 shadow-[0_12px_28px_-36px_rgba(0,0,0,0.45)]'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border border-[rgba(0,0,0,0.05)] bg-white'>
                <AvatarImage src={request.profilePicture} />
                <AvatarFallback>RQ</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-[#333333]'>{request.username}</span>
                <span className='text-xs text-[#8c8c8c]'>{request.bio || 'Wants to follow you'}</span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='sm' className='px-4' onClick={() => handleRespond(request._id, 'accept')}>
                Confirm
              </Button>
              <Button size='sm' variant='outline' className='border-[rgba(0,0,0,0.08)] text-[#6f6f6f] hover:bg-white/80' onClick={() => handleRespond(request._id, 'decline')}>
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
