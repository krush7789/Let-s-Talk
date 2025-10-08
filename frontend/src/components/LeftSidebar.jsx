import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, Sparkles, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const LeftSidebar = ({ mobileOpen, onMobileClose, createOpen, onCreateOpenChange }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector(store => store.auth)
  const { likeNotification } = useSelector(store => store.realTimeNotification)
  const dispatch = useDispatch()

  const logoutHandler = async () => {
    try {
      const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/user/logout', { withCredentials: true })
      if (res.data.success) {
        dispatch(setAuthUser(null))
        dispatch(setSelectedPost(null))
        dispatch(setPosts([]))
        navigate('/login')
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to logout right now')
    }
  }

  const routeForItem = (textType) => {
    switch (textType) {
      case 'Home':
        return '/'
      case 'Search':
        return '/search'
      case 'Explore':
        return '/explore'
      case 'Messages':
        return '/chat'
      case 'Notifications':
        return '/notifications'
      case 'Profile':
        return `/profile/${user?._id}`
      default:
        return null
    }
  }

  const sidebarHandler = (textType) => {
    if (textType === 'Logout') {
      logoutHandler()
      onMobileClose?.()
      return
    }

    if (textType === 'Create') {
      onCreateOpenChange?.(true)
      onMobileClose?.()
      return
    }

    if (textType === 'Notifications' && !likeNotification.length) {
      toast.info('You are all caught up!')
    }

    const route = routeForItem(textType)
    if (route) {
      navigate(route)
      onMobileClose?.()
    }
  }

  const sidebarItems = [
    { icon: <Home className='h-5 w-5' />, text: 'Home', helper: 'Curated timeline' },
    { icon: <Search className='h-5 w-5' />, text: 'Search', helper: 'Find creators & spaces' },
    { icon: <TrendingUp className='h-5 w-5' />, text: 'Explore', helper: 'Trending topics' },
    { icon: <MessageCircle className='h-5 w-5' />, text: 'Messages', helper: 'Chat & collaborate' },
    { icon: <Heart className='h-5 w-5' />, text: 'Notifications', helper: 'Reactions & follows' },
    { icon: <PlusSquare className='h-5 w-5' />, text: 'Create', helper: 'Share something new' },
    {
      icon: (
        <Avatar className='h-8 w-8 border border-[rgba(0,0,0,0.05)] bg-white'>
          <AvatarImage src={user?.profilePicture} alt={user?.username} />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      ),
      text: 'Profile',
      helper: 'View your canvas'
    },
    { icon: <LogOut className='h-5 w-5' />, text: 'Logout', helper: 'Sign out securely' }
  ]

  const isActive = (text) => {
    const route = routeForItem(text)
    if (!route) return false
    if (text === 'Profile') {
      return location.pathname.startsWith(`/profile/${user?._id}`)
    }
    return location.pathname === route
  }

  const notificationBadge = likeNotification.length > 0 && (
    <span className='absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#c8a9f1] via-[#d5b69d] to-[#f8c8a3] text-xs font-semibold text-[#333333] shadow-sm shadow-[rgba(200,169,241,0.35)]'>
      {likeNotification.length}
    </span>
  )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          'fixed left-3 top-3 z-50 flex h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xs flex-col gap-8 overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/90 p-6 shadow-[0_30px_60px_-45px_rgba(51,51,51,0.65)] ring-1 ring-white/40 transition-transform duration-300 lg:static lg:h-[calc(100vh-7rem)] lg:w-72 lg:max-w-none lg:translate-x-0 lg:rounded-[2.5rem] lg:border-[rgba(0,0,0,0.05)] lg:bg-white/80 lg:px-7 lg:py-8',
          mobileOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        )}
      >
        <div className='flex flex-col gap-4 rounded-3xl border border-[rgba(0,0,0,0.05)] bg-[rgba(255,255,255,0.85)] p-5 shadow-[inset_0_18px_40px_-38px_rgba(200,169,241,0.6)]'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12 border border-[rgba(0,0,0,0.05)] bg-white'>
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback>{user?.username?.slice(0, 2)?.toUpperCase() || 'ME'}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold text-[#4a4a4a]'>{user?.username}</span>
              <span className='text-xs text-[#6f6f6f]'>{user?.bio || 'Craft your story & inspire others'}</span>
            </div>
          </div>
          <div className='rounded-2xl border border-[rgba(0,0,0,0.04)] bg-gradient-to-br from-[#fbf7ff] via-white to-[#fff8f3] p-4 text-xs text-[#4a4a4a] shadow-[0_20px_35px_-40px_rgba(200,169,241,0.7)]'>
            <p className='font-medium text-[#333333]'>Daily spark</p>
            <p className='mt-1 text-[#6f6f6f]'>Share something uplifting today and keep your streak alive.</p>
            <Button
              size='sm'
              className='mt-3 w-full justify-center'
              onClick={() => {
                onCreateOpenChange?.(true)
                onMobileClose?.()
              }}
            >
              Create post
            </Button>
          </div>
        </div>

        <nav className='flex flex-1 flex-col gap-2 overflow-y-auto pr-1'>
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className={cn(
                'group relative flex items-center justify-between gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-200',
                isActive(item.text)
                  ? 'border-[#c8a9f1]/60 bg-gradient-to-r from-[#c8a9f1]/35 via-[#e8d6c6]/30 to-[#f8c8a3]/40 text-[#4a4a4a] shadow-[0_18px_42px_-32px_rgba(200,169,241,0.8)]'
                  : 'text-[#4a4a4a] hover:border-[rgba(0,0,0,0.06)] hover:bg-white/80 hover:text-[#333333]'
              )}
            >
              <div className='flex items-center gap-3'>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-[#b8b8b8] transition-colors duration-200 shadow-[inset_0_8px_18px_-20px_rgba(0,0,0,0.5)]', isActive(item.text) && 'bg-white text-[#4a4a4a] shadow-[inset_0_0_0_1px_rgba(200,169,241,0.6)]')}>
                  {item.icon}
                </span>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{item.text}</span>
                  <span className='text-[11px] text-[#8c8c8c] group-hover:text-[#666666]'>{item.helper}</span>
                </div>
              </div>
              {item.text === 'Notifications' && notificationBadge}
            </button>
          ))}
        </nav>

        <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-5 text-xs text-[#6f6f6f] shadow-[inset_0_18px_36px_-40px_rgba(0,0,0,0.45)]'>
          <div className='flex items-start gap-3'>
            <div className='rounded-2xl bg-[#c8a9f1]/30 p-2 text-[#c8a9f1]'>
              <Sparkles className='h-4 w-4' />
            </div>
            <div className='space-y-2'>
              <p className='font-semibold text-[#333333]'>Need a spark?</p>
              <p>Jump into Explore to find creators and conversations tailored for you.</p>
            </div>
          </div>
        </div>

        <CreatePost open={createOpen} setOpen={onCreateOpenChange} />
      </aside>
    </>
  )
}

export default LeftSidebar
