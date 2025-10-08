import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { BellRing, Heart, RefreshCw } from 'lucide-react'
import { clearNotifications } from '@/redux/rtnSlice'

const Notifications = () => {
  const dispatch = useDispatch()
  const { likeNotification } = useSelector(store => store.realTimeNotification)

  const groupedNotifications = useMemo(() => {
    const groups = likeNotification.reduce((acc, notification) => {
      const key = notification.userId
      if (!acc[key]) {
        acc[key] = { ...notification, count: 1 }
      } else {
        acc[key].count += 1
      }
      return acc
    }, {})

    return Object.values(groups)
  }, [likeNotification])

  const markAllAsRead = () => {
    dispatch(clearNotifications())
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
          groupedNotifications.map(notification => (
            <article
              key={notification.userId}
              className='flex items-center justify-between gap-4 rounded-3xl border border-slate-800/60 bg-slate-950/50 p-5 shadow-inner shadow-sky-500/5'
            >
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Avatar className='h-12 w-12 border border-slate-900'>
                    <AvatarImage src={notification.userDetails?.profilePicture} alt={notification.userDetails?.username} />
                    <AvatarFallback>{notification.userDetails?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                  </Avatar>
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow shadow-rose-500/40'>
                    <Heart className='h-3 w-3' />
                  </span>
                </div>
                <div className='flex flex-col'>
                  <p className='text-sm text-slate-200'>
                    <span className='font-semibold text-slate-50'>{notification.userDetails?.username}</span>{' '}
                    appreciated your post
                  </p>
                  <span className='text-xs text-slate-500'>
                    {notification.count > 1 ? `${notification.count} interactions` : 'Just now'}
                  </span>
                </div>
              </div>
              <Button
                variant='secondary'
                className='rounded-full border-slate-800/70 bg-slate-900/60 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-700 hover:bg-slate-900'
              >
                View post
              </Button>
            </article>
          ))
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
