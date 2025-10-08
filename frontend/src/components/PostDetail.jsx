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
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[2.5rem] border border-slate-800/60 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <div className='flex items-center justify-between gap-4'>
        <Button
          variant='ghost'
          onClick={goBack}
          className='flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/50 px-4 text-sm text-slate-200 hover:bg-slate-900/70'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          variant='ghost'
          className='flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/50 px-4 text-sm text-slate-200 hover:bg-slate-900/70'
          onClick={() => navigate('/explore')}
        >
          <Compass className='h-4 w-4 text-sky-300' />
          Explore more
        </Button>
      </div>

      {!posts.length && (
        <div className='rounded-3xl border border-slate-800/60 bg-slate-950/60 p-10 text-center text-sm text-slate-400'>
          Fetching the latest vibes for you...
        </div>
      )}

      {posts.length > 0 && !post && (
        <div className='rounded-3xl border border-slate-800/60 bg-slate-950/60 p-10 text-center text-sm text-slate-400'>
          This post is no longer available. Discover new stories in Explore!
        </div>
      )}

      {post && <Post post={post} />}
    </div>
  )
}

export default PostDetail
