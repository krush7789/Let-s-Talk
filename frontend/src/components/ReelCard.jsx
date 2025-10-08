import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Heart, Play } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toggleReelLike } from '@/redux/reelSlice'

const ReelCard = ({ reel }) => {
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const [viewed, setViewed] = useState(reel.views?.includes(user?._id))
  const [likeLoading, setLikeLoading] = useState(false)
  const isLiked = reel.likes?.includes(user?._id)

  const toggleLike = async () => {
    if (!user?._id) return
    try {
      setLikeLoading(true)
      if (isLiked) {
        await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/reel/${reel._id}/unlike`, {}, { withCredentials: true })
        dispatch(toggleReelLike({ reelId: reel._id, userId: user._id, liked: false }))
      } else {
        await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/reel/${reel._id}/like`, {}, { withCredentials: true })
        dispatch(toggleReelLike({ reelId: reel._id, userId: user._id, liked: true }))
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLikeLoading(false)
    }
  }

  const markView = async () => {
    if (viewed || !user?._id) return
    try {
      setViewed(true)
      await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/reel/${reel._id}/view`, {}, { withCredentials: true })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='overflow-hidden rounded-[1.75rem] border border-[rgba(0,0,0,0.05)] bg-white/85 shadow-[0_28px_70px_-55px_rgba(200,169,241,0.55)]'>
      <div className='flex items-center gap-3 px-5 py-4'>
        <Avatar className='h-10 w-10 border border-[rgba(0,0,0,0.05)] bg-white'>
          <AvatarImage src={reel.author?.profilePicture} />
          <AvatarFallback>AU</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-[#333333]'>{reel.author?.username}</span>
          <span className='text-xs text-[#8c8c8c]'>{new Date(reel.createdAt).toLocaleString()}</span>
        </div>
      </div>
      <div className='relative bg-black'>
        <video
          src={reel.videoUrl}
          controls
          playsInline
          className='w-full max-h-[480px] object-contain bg-black'
          onPlay={markView}
        />
        <div className='absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white'>
          <Play size={14} />
          <span>{reel.views?.length || 0} views</span>
        </div>
      </div>
      <div className='flex flex-col gap-3 p-5 text-sm text-[#4a4a4a]'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={toggleLike}
            disabled={likeLoading}
            className={isLiked ? 'border-transparent bg-[#d66c6c] text-white hover:bg-[#c45c5c]' : 'border-[rgba(0,0,0,0.1)] text-[#6f6f6f] hover:bg-white'}
          >
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current text-white' : 'text-[#d66c6c]'}`} />
            {isLiked ? 'Liked' : 'Appreciate'}
          </Button>
          <span className='text-xs text-[#8c8c8c]'>{reel.likes?.length || 0} appreciations</span>
        </div>
        {reel.caption && (
          <p className='leading-6 text-[#4a4a4a]'>
            <span className='mr-2 font-semibold text-[#333333]'>{reel.author?.username}</span>
            {reel.caption}
          </p>
        )}
      </div>
    </div>
  )
}

export default ReelCard
