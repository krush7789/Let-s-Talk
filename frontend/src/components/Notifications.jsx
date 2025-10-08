import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { BellRing, Heart, ImageIcon, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearNotifications, dismissNotification } from '@/redux/rtnSlice'
import useGetAllPost from '@/hooks/useGetAllPost'

const Notifications = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useGetAllPost()
  const { likeNotification } = useSelector(store => store.realTimeNotification)
  const { posts } = useSelector(store => store.post)

  const groupedNotifications = useMemo(() => {
    const groups = likeNotification.reduce((acc, notification) => {
      const key = notification.postId || notification.userId
      if (!acc[key]) {
        acc[key] = {
          postId: notification.postId,
          count: 1,
          users: notification.userDetails ? [notification.userDetails] : [],
          latest: notification
        }
      } else {
        acc[key].count += 1
        if (
          notification.userDetails &&
          !acc[key].users.some(user => user?._id === notification.userId)
        ) {
          acc[key].users.push(notification.userDetails)
        }
        acc[key].latest = notification
      }
      return acc
    }, {})

    return Object.values(groups).reverse()
  }, [likeNotification])

  const markAllAsRead = () => {
    dispatch(clearNotifications())
  }

  const buildMessage = (notification) => {
    if (!notification.users.length) {
      return notification.latest?.message || 'You have new activity'
    }

    const [firstUser, ...rest] = notification.users
    if (!rest.length) {
      return `${firstUser?.username || 'Someone'} appreciated your post`
    }

    return `${firstUser?.username || 'Someone'} and ${rest.length} other${rest.length > 1 ? 's' : ''} appreciated your post`
  }

  const handleViewPost = (postId) => {
    if (!postId) return
    navigate(`/p/${postId}`)
    dispatch(dismissNotification(postId))
  }

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[2.5rem] border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-slate-50'>Notifications</h1>
          <p className='text-sm text-slate-400'>Stay in the loop with the latest reactions and follows.</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/50 px-4 py-2 text-xs uppercase tracking-wide text-slate-400'>
            <BellRing className='h-4 w-4 text-emerald-300' />
            Live sync
          </div>
          <Button
            variant='secondary'
            onClick={markAllAsRead}
            className='flex items-center gap-2 rounded-full border-slate-800/70 bg-slate-900/60 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-700 hover:bg-slate-900'
            disabled={!likeNotification.length}
          >
            <RefreshCw className='h-4 w-4' />
            Clear all
          </Button>
        </div>
      </header>

      <section className='space-y-4'>
        {groupedNotifications.length ? (
          groupedNotifications.map(notification => {
            const previewPost = posts.find(post => post._id === notification.postId)
            const primaryUser = notification.users[0]
            const derivedKey = notification.postId || primaryUser?._id || notification.latest?.userId

            return (
            <article
              key={derivedKey}
              className='flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/60 bg-slate-950/50 p-5 shadow-inner shadow-sky-500/5'
            >
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Avatar className='h-12 w-12 border border-slate-900'>
                    <AvatarImage src={primaryUser?.profilePicture} alt={primaryUser?.username} />
                    <AvatarFallback>{primaryUser?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                  </Avatar>
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow shadow-rose-500/40'>
                    <Heart className='h-3 w-3' />
                  </span>
                </div>
                <div className='flex flex-col'>
                  <p className='text-sm text-slate-200'>{buildMessage(notification)}</p>
                  <span className='text-xs text-slate-500'>
                    {notification.count > 1 ? `${notification.count} interactions` : 'Just now'}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                {previewPost ? (
                  <img
                    src={previewPost.image}
                    alt={previewPost.caption}
                    className='h-16 w-16 rounded-2xl object-cover'
                  />
                ) : (
                  <span className='flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/60 text-slate-500'>
                    <ImageIcon className='h-5 w-5' />
                  </span>
                )}
                <div className='flex items-center gap-2'>
                  <Button
                    variant='secondary'
                    className='rounded-full border-slate-800/70 bg-slate-900/60 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    onClick={() => handleViewPost(notification.postId)}
                    disabled={!notification.postId}
                  >
                    View post
                  </Button>
                  <Button
                    variant='ghost'
                    className='rounded-full border border-transparent text-xs font-semibold uppercase tracking-wide text-slate-400 hover:border-slate-800/70 hover:bg-slate-900/60 hover:text-slate-200'
                    onClick={() => dispatch(dismissNotification(derivedKey))}
                  >
                    Mark read
                  </Button>
                </div>
              </div>
            </article>
            )
          })
        ) : (
          <div className='rounded-3xl border border-slate-800/60 bg-slate-950/50 p-12 text-center text-sm text-slate-400'>
            You&apos;re all caught up. Start engaging with others to see activity here!
          </div>
        )}
      </section>
    </div>
  )
}

export default Notifications
