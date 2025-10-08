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
    <span className='absolute right-2 top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm bg-[var(--color-primary-start)] text-[11px] font-semibold text-white'>
      {likeNotification.length}
    </span>
  )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          'fixed left-4 top-24 z-50 flex h-[calc(100vh-136px)] w-[min(280px,calc(100%-2rem))] flex-col overflow-hidden rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface-raised)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 lg:static lg:h-[calc(100vh-120px)] lg:w-64 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        )}
      >
        <div className='space-y-4 border-b border-[var(--color-outline)] px-5 py-6'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12 border border-[var(--color-outline)] bg-[var(--color-surface)]'>
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback>{user?.username?.slice(0, 2)?.toUpperCase() || 'ME'}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold text-[var(--color-text)]'>{user?.username}</span>
              <span className='text-xs text-[var(--color-text-muted)]'>{user?.bio || 'Craft your story & inspire others'}</span>
            </div>
          </div>
          <Button
            size='sm'
            className='w-full justify-center'
            onClick={() => {
              onCreateOpenChange?.(true)
              onMobileClose?.()
            }}
          >
            Create post
          </Button>
        </div>

        <nav className='flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4'>
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className={cn(
                'group relative flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-[var(--color-text-muted)] transition-colors',
                isActive(item.text)
                  ? 'border-[var(--color-outline)] bg-[var(--color-surface-muted)] text-[var(--color-text)]'
                  : 'hover:border-[var(--color-outline)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              )}
            >
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface)] text-[#9d9d9d] transition-colors',
                    isActive(item.text) && 'bg-[var(--color-primary-start)]/15 text-[var(--color-text)]'
                  )}
                >
                  {item.icon}
                </span>
                <div className='flex flex-col'>
                  <span>{item.text}</span>
                  <span className='text-[11px] font-normal text-[#888888] group-hover:text-[var(--color-text-muted)]'>{item.helper}</span>
                </div>
              </div>
              {item.text === 'Notifications' && notificationBadge}
            </button>
          ))}
        </nav>

        <div className='mt-auto border-t border-[var(--color-outline)] px-5 py-5 text-xs text-[var(--color-text-muted)]'>
          <div className='flex items-start gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary-start)]/15 text-[var(--color-primary-start)]'>
              <Sparkles className='h-4 w-4' />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-[var(--color-text)]'>Need a spark?</p>
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
