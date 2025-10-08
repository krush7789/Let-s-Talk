import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const { user } = useSelector(store => store.auth)
  const { posts } = useSelector(store => store.post)
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false)
  const [postLike, setPostLike] = useState(post.likes.length)
  const [comment, setComment] = useState(post.comments)
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    const inputText = e.target.value
    if (inputText.trim()) {
      setText(inputText)
    } else {
      setText('')
    }
  }

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like'
      const res = await axios.get(`https://let-s-talk-lq7h.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true })
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1
        setPostLike(updatedLikes)
        setLiked(!liked)

        const updatedPostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        )
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const commentHandler = async () => {
    try {
      const res = await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/post/${post._id}/comment`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment]
        setComment(updatedCommentData)

        const updatedPostData = posts.map(p =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        )

        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
        setText('')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`https://let-s-talk-lq7h.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id)
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Unable to remove post right now')
    }
  }

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(`https://let-s-talk-lq7h.onrender.com/api/v1/post/${post?._id}/bookmark`, { withCredentials: true })
      if (res.data.success) {
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='w-full overflow-hidden rounded-[2.25rem] border border-[rgba(0,0,0,0.05)] bg-white/85 shadow-[0_30px_80px_-60px_rgba(51,51,51,0.65)] backdrop-blur-xl'>
      <div className='flex items-center justify-between gap-4 px-6 pb-4 pt-6'>
        <div className='flex items-center gap-3'>
          <div className='rounded-3xl bg-gradient-to-br from-[#c8a9f1]/40 via-[#e8d6c6]/30 to-[#f8c8a3]/30 p-[2px]'>
            <Avatar className='h-12 w-12 border border-[rgba(0,0,0,0.05)] bg-white'>
              <AvatarImage src={post.author?.profilePicture} alt='post_image' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-3'>
              <h1 className='text-sm font-semibold text-[#333333]'>{post.author?.username}</h1>
              {user?._id === post.author._id && <Badge className='bg-[#f0e9ff] text-[#6f6f6f]'>Author</Badge>}
            </div>
            <span className='text-xs text-[#8c8c8c]'>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/80 hover:bg-white'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-w-sm flex-col items-stretch gap-2 border border-[rgba(0,0,0,0.08)] bg-white/90 text-sm text-[#4a4a4a] shadow-[0_20px_60px_-48px_rgba(51,51,51,0.55)]'>
            {post?.author?._id !== user?._id && <Button variant='ghost' className='w-full justify-start text-[#c76b6b] hover:text-[#b25a5a]'>Unfollow</Button>}
            <Button variant='ghost' className='w-full justify-start text-[#4a4a4a] hover:text-[#333333]'>Add to favorites</Button>
            {user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className='w-full justify-start text-[#5a8a6b] hover:text-[#4a785c]'>Delete</Button>}
          </DialogContent>
        </Dialog>
      </div>
      <div className='relative bg-[#f6f6f6]'>
        <img
          className='aspect-square w-full rounded-[2rem] object-cover'
          src={post.image}
          alt='post_img'
        />
        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
      </div>

      <div className='space-y-4 px-6 py-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {liked
              ? <FaHeart onClick={likeOrDislikeHandler} size={24} className='cursor-pointer text-[#d66c6c] drop-shadow-[0_0_12px_rgba(214,108,108,0.4)]' />
              : <FaRegHeart onClick={likeOrDislikeHandler} size={22} className='cursor-pointer text-[#b8b8b8] transition hover:text-[#d5b69d]' />}

            <MessageCircle
              onClick={() => {
                dispatch(setSelectedPost(post))
                setOpen(true)
              }}
              className='h-5 w-5 cursor-pointer text-[#b8b8b8] transition hover:text-[#d5b69d]'
            />
            <Send className='h-5 w-5 cursor-pointer text-[#b8b8b8] transition hover:text-[#d5b69d]' />
          </div>
          <Bookmark onClick={bookmarkHandler} className='h-5 w-5 cursor-pointer text-[#b8b8b8] transition hover:text-[#d5b69d]' />
        </div>
        <div className='space-y-2 text-sm text-[#4a4a4a]'>
          <span className='font-medium text-[#c8a9f1]'>{postLike} appreciations</span>
          <p className='leading-6'>
            <span className='mr-2 font-semibold text-[#333333]'>{post.author?.username}</span>
            {post.caption}
          </p>
          {comment.length > 0 && (
            <button
              type='button'
              onClick={() => {
                dispatch(setSelectedPost(post))
                setOpen(true)
              }}
              className='text-xs text-[#8c8c8c] transition hover:text-[#4a4a4a]'
            >
              View all {comment.length} responses
            </button>
          )}
        </div>
        <CommentDialog open={open} setOpen={setOpen} />
        <div className='flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/70 px-4 py-2'>
          <input
            type='text'
            placeholder='Add a thoughtful response...'
            value={text}
            onChange={changeEventHandler}
            className='w-full bg-transparent text-sm text-[#333333] placeholder:text-[#b8b8b8] focus:outline-none'
          />
          {text && <button onClick={commentHandler} className='text-sm font-semibold text-[#c8a9f1] transition hover:text-[#b897e9]'>Post</button>}
        </div>
      </div>
    </div>
  )
}

export default Post
