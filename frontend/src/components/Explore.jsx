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
      <div className='flex flex-col gap-4 rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white/80 p-8 text-[#4a4a4a] shadow-[0_32px_80px_-60px_rgba(51,51,51,0.6)] backdrop-blur-xl'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold text-[#333333]'>Explore trending stories</h1>
          <p className='text-sm text-[#6f6f6f]'>Dive into the moments people are loving right now across NovaSphere.</p>
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
                    ? 'border-[#c8a9f1]/60 bg-gradient-to-r from-[#c8a9f1]/30 via-[#e8d6c6]/30 to-[#f8c8a3]/35 text-[#333333] shadow-[0_18px_42px_-32px_rgba(200,169,241,0.7)]'
                    : 'border-[rgba(0,0,0,0.05)] bg-white/70 text-[#6f6f6f] hover:border-[rgba(0,0,0,0.08)] hover:bg-white/85 hover:text-[#333333]'
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
              className='group overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/80 shadow-[0_28px_60px_-48px_rgba(51,51,51,0.55)] transition hover:border-[rgba(0,0,0,0.08)] hover:shadow-[0_32px_70px_-50px_rgba(200,169,241,0.6)]'
            >
              <div className='relative'>
                <img src={post.image} alt={post.caption} className='aspect-square w-full object-cover' />
                <div className='absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                  <div>
                    <p className='text-sm font-semibold text-white'>{post.author?.username}</p>
                    <p className='text-xs text-white/80 line-clamp-2'>{post.caption}</p>
                  </div>
                  <div className='rounded-full bg-black/40 px-3 py-1 text-xs text-white/85'>
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
              className='group overflow-hidden rounded-3xl border border-[rgba(200,169,241,0.4)] bg-white/80 shadow-[0_28px_60px_-48px_rgba(200,169,241,0.45)] transition hover:border-[#c8a9f1]/60 hover:shadow-[0_32px_72px_-46px_rgba(200,169,241,0.65)]'
            >
              <div className='relative'>
                <video
                  src={reel.videoUrl}
                  muted
                  loop
                  playsInline
                  className='aspect-[9/16] w-full object-cover'
                />
                <div className='absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-9 w-9 border border-[rgba(255,255,255,0.6)]'>
                      <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                      <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='text-sm font-semibold text-white'>{reel.author?.username}</span>
                      <span className='text-xs text-white/80'>{reel.views?.length || 0} views</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='rounded-full bg-black/40 px-3 py-1 text-xs text-white/85'>
                      {reel.likes?.length || 0} likes
                    </div>
                    <span className='inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
                      <PlayCircle className='h-4 w-4' />
                      Watch
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {!trendingPosts.length && !trendingReels.length && (
            <div className='col-span-full rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f] shadow-[0_24px_60px_-48px_rgba(51,51,51,0.45)]'>
              Nothing to explore just yet. Follow more creators to fill this space with inspiration!
            </div>
          )}
        </div>

        <aside className='flex h-fit flex-col gap-6 rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-6 shadow-[0_24px_60px_-52px_rgba(51,51,51,0.45)]'>
          <div className='flex items-center gap-3 text-[#4a4a4a]'>
            <TrendingUp className='h-5 w-5 text-[#c8a9f1]' />
            <span className='text-sm font-semibold uppercase tracking-wide text-[#8c8c8c]'>Trending hashtags</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {topHashtags.length ? (
              topHashtags.map(([tag, count]) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-white/80 px-3 py-1 text-xs text-[#4a4a4a] shadow-[0_10px_24px_-30px_rgba(0,0,0,0.45)]'
                >
                  <Hash className='h-3 w-3 text-[#c8a9f1]' />
                  {tag} · {count}
                </span>
              ))
            ) : (
              <p className='text-xs text-[#8c8c8c]'>Start a trend by adding hashtags when you post.</p>
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
