import { useMemo, useState } from 'react'
import { Compass, Film, Hash, ImageIcon, PlayCircle, TrendingUp } from 'lucide-react'
import { useSelector } from 'react-redux'
import useGetAllPost from '@/hooks/useGetAllPost'
import useReels from '@/hooks/useReels'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import ReelPlayerDialog from './ReelPlayerDialog'

const FILTERS = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'posts', label: 'Posts', icon: ImageIcon },
  { id: 'reels', label: 'Reels', icon: Film }
]

const Explore = () => {
  useGetAllPost()
  useReels()

  const [activeFilter, setActiveFilter] = useState('all')
  const [activeReel, setActiveReel] = useState(null)
  const { posts } = useSelector(store => store.post)
  const { reels } = useSelector(store => store.reel)

  const topHashtags = useMemo(() => {
    const hashtagCounts = posts.reduce((acc, post) => {
      const matches = post?.caption?.match(/#\w+/g) || []
      matches.forEach(tag => {
        const normalized = tag.toLowerCase()
        acc[normalized] = (acc[normalized] || 0) + 1
      })
      return acc
    }, {})

    return Object.entries(hashtagCounts)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 6)
  }, [posts])

  const trendingPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => b.likes.length - a.likes.length)
    if (activeFilter === 'reels') return []
    return activeFilter === 'posts' ? sorted : sorted.slice(0, 12)
  }, [activeFilter, posts])

  const trendingReels = useMemo(() => {
    if (activeFilter === 'posts') return []
    const sorted = [...reels].sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0))
    return activeFilter === 'reels' ? sorted : sorted.slice(0, 8)
  }, [activeFilter, reels])

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-10'>
      <div className='flex flex-col gap-4 rounded-[2.5rem] border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold text-slate-50'>Explore trending stories</h1>
          <p className='text-sm text-slate-400'>Dive into the moments people are loving right now across NovaSphere.</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          {FILTERS.map(filter => {
            const Icon = filter.icon
            const isActive = filter.id === activeFilter
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? 'border-sky-400/40 bg-sky-500/20 text-sky-100 shadow-lg shadow-sky-500/20'
                    : 'border-slate-800/70 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-100'
                }`}
              >
                <Icon className='h-4 w-4' />
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className='grid gap-8 lg:grid-cols-[1fr_280px]'>
        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {trendingPosts.map(post => (
            <Link
              key={post._id}
              to={`/p/${post._id}`}
              className='group overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-lg shadow-sky-500/10 transition hover:border-slate-700 hover:shadow-sky-500/20'
            >
              <div className='relative'>
                <img src={post.image} alt={post.caption} className='aspect-square w-full object-cover' />
                <div className='absolute inset-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                  <div>
                    <p className='text-sm font-semibold text-slate-50'>{post.author?.username}</p>
                    <p className='text-xs text-slate-300 line-clamp-2'>{post.caption}</p>
                  </div>
                  <div className='rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200'>
                    {post.likes.length} likes
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {trendingReels.map(reel => (
            <button
              key={reel._id}
              type='button'
              onClick={() => setActiveReel(reel)}
              className='group overflow-hidden rounded-3xl border border-violet-500/30 bg-slate-950/50 shadow-lg shadow-violet-500/20 transition hover:border-violet-400/50 hover:shadow-violet-500/30'
            >
              <div className='relative'>
                <video
                  src={reel.videoUrl}
                  muted
                  loop
                  playsInline
                  className='aspect-[9/16] w-full object-cover'
                />
                <div className='absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-9 w-9 border border-slate-900/80'>
                      <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                      <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='text-sm font-semibold text-slate-50'>{reel.author?.username}</span>
                      <span className='text-xs text-slate-300'>{reel.views?.length || 0} views</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200'>
                      {reel.likes?.length || 0} likes
                    </div>
                    <span className='inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200'>
                      <PlayCircle className='h-4 w-4' />
                      Watch
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {!trendingPosts.length && !trendingReels.length && (
            <div className='col-span-full rounded-3xl border border-slate-800/60 bg-slate-950/50 p-10 text-center text-sm text-slate-400'>
              Nothing to explore just yet. Follow more creators to fill this space with inspiration!
            </div>
          )}
        </div>

        <aside className='flex h-fit flex-col gap-6 rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6'>
          <div className='flex items-center gap-3 text-slate-100'>
            <TrendingUp className='h-5 w-5 text-emerald-300' />
            <span className='text-sm font-semibold uppercase tracking-wide text-slate-300'>Trending hashtags</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {topHashtags.length ? (
              topHashtags.map(([tag, count]) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/60 px-3 py-1 text-xs text-slate-200'
                >
                  <Hash className='h-3 w-3 text-sky-300' />
                  {tag} · {count}
                </span>
              ))
            ) : (
              <p className='text-xs text-slate-500'>Start a trend by adding hashtags when you post.</p>
            )}
          </div>
        </aside>
      </div>

      <ReelPlayerDialog
        reel={activeReel}
        open={Boolean(activeReel)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveReel(null)
          }
        }}
      />
    </div>
  )
}

export default Explore
