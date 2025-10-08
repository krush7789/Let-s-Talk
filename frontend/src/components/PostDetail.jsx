import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import useGetAllPost from '@/hooks/useGetAllPost'
import { Button } from './ui/button'
import Post from './Post'
import { setSelectedPost } from '@/redux/postSlice'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  useGetAllPost()
  const dispatch = useDispatch()
  const { posts } = useSelector(store => store.post)

  const post = posts.find(item => item._id === id)

  useEffect(() => {
    if (post) {
      dispatch(setSelectedPost(post))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [dispatch, post])

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white/80 p-6 text-[#4a4a4a] shadow-[0_30px_80px_-60px_rgba(51,51,51,0.55)] backdrop-blur-xl'>
      <div className='flex items-center justify-between gap-4'>
        <Button
          variant='outline'
          onClick={goBack}
          className='flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white/80 px-4 text-sm text-[#4a4a4a] hover:bg-white'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          variant='outline'
          className='flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white/80 px-4 text-sm text-[#4a4a4a] hover:bg-white'
          onClick={() => navigate('/explore')}
        >
          <Compass className='h-4 w-4 text-[#c8a9f1]' />
          Explore more
        </Button>
      </div>

      {!posts.length && (
        <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f]'>
          Fetching the latest vibes for you...
        </div>
      )}

      {posts.length > 0 && !post && (
        <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f]'>
          This post is no longer available. Discover new stories in Explore!
        </div>
      )}

      {post && <Post post={post} />}
    </div>
  )
}

export default PostDetail
