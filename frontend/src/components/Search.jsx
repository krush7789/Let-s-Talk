import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import useReels from '@/hooks/useReels'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { PlayCircle, Search as SearchIcon } from 'lucide-react'
import ReelPlayerDialog from './ReelPlayerDialog'

const Search = () => {
  useGetAllPost()
  useGetSuggestedUsers()
  useReels()

  const [query, setQuery] = useState('')
  const [activeReel, setActiveReel] = useState(null)
  const { posts } = useSelector(store => store.post)
  const { reels } = useSelector(store => store.reel)
  const { suggestedUsers, user } = useSelector(store => store.auth)

  const normalizedQuery = query.trim().toLowerCase()

  const matchingPeople = useMemo(() => {
    if (!normalizedQuery) return suggestedUsers
    const haystack = suggestedUsers || []
    return haystack.filter(person => {
      const username = person?.username?.toLowerCase() || ''
      const bio = person?.bio?.toLowerCase() || ''
      return username.includes(normalizedQuery) || bio.includes(normalizedQuery)
    })
  }, [normalizedQuery, suggestedUsers])

  const matchingPosts = useMemo(() => {
    if (!normalizedQuery) return posts
    return posts.filter(post => {
      const caption = post?.caption?.toLowerCase() || ''
      const author = post?.author?.username?.toLowerCase() || ''
      return caption.includes(normalizedQuery) || author.includes(normalizedQuery)
    })
  }, [normalizedQuery, posts])

  const matchingReels = useMemo(() => {
    if (!normalizedQuery) return reels
    return reels.filter(reel => {
      const caption = reel?.caption?.toLowerCase() || ''
      const author = reel?.author?.username?.toLowerCase() || ''
      return caption.includes(normalizedQuery) || author.includes(normalizedQuery)
    })
  }, [normalizedQuery, reels])

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[2.5rem] border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <div className='space-y-3'>
        <h1 className='text-2xl font-semibold text-slate-50'>Search NovaSphere</h1>
        <p className='text-sm text-slate-400'>Find creators, communities, and posts tailored to your vibe.</p>
        <div className='relative'>
          <SearchIcon className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search for people or captions'
            className='h-12 rounded-full border-slate-800/80 bg-slate-950/60 pl-11 text-slate-100 placeholder:text-slate-500'
          />
        </div>
      </div>

      <section className='grid gap-10 lg:grid-cols-[260px_1fr]'>
        <div className='space-y-5 rounded-3xl border border-slate-800/50 bg-slate-950/40 p-5'>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span className='font-semibold text-slate-200'>People</span>
            <span>{matchingPeople.length} results</span>
          </div>
          <div className='flex flex-col gap-3'>
            {matchingPeople.length ? (
              matchingPeople.map(person => (
                <Link
                  key={person._id}
                  to={`/profile/${person._id}`}
                  className='group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-slate-800/70 hover:bg-slate-900/60'
                >
                  <Avatar className='h-10 w-10 border border-slate-900'>
                    <AvatarImage src={person.profilePicture} alt={person.username} />
                    <AvatarFallback>{person.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium text-slate-100 group-hover:text-slate-50'>{person.username}</span>
                    <span className='text-xs text-slate-400'>{person.bio || 'New to the community'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-500'>
                No people matched your search yet. Try a different name or keyword.
              </div>
            )}
          </div>
        </div>

        <div className='space-y-5'>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span className='font-semibold text-slate-200'>Posts & captions</span>
            <span>{matchingPosts.length} results</span>
          </div>
          {matchingPosts.length ? (
            <div className='grid gap-4 sm:grid-cols-2'>
              {matchingPosts.map(post => (
                <article
                  key={post._id}
                  className='group flex flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-lg shadow-sky-500/10 transition hover:border-slate-700 hover:shadow-sky-500/20'
                >
                  <Link to={`/p/${post._id}`} className='relative block'>
                    <img src={post.image} alt={post.caption} className='aspect-square w-full object-cover' />
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100' />
                  </Link>
                  <div className='flex flex-1 flex-col gap-3 p-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-9 w-9 border border-slate-900/80'>
                        <AvatarImage src={post.author?.profilePicture} alt={post.author?.username} />
                        <AvatarFallback>{post.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm font-semibold text-slate-100'>{post.author?.username}</span>
                        <span className='text-xs text-slate-500'>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className='text-sm leading-5 text-slate-300'>{post.caption || 'Shared a new moment'}</p>
                    <div className='mt-auto flex flex-wrap gap-2'>
                      <Button
                        variant='secondary'
                        className='rounded-full border-slate-800/70 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                        asChild
                      >
                        <Link to={`/p/${post._id}`}>View post</Link>
                      </Button>
                      <Button
                        variant='ghost'
                        className='rounded-full border border-transparent text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/60'
                        asChild
                      >
                        <Link to={`/profile/${post.author?._id}`}>View profile</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className='rounded-3xl border border-slate-800/60 bg-slate-950/50 p-10 text-center text-sm text-slate-500'>
              No posts matched your search. Try different keywords or explore trending topics.
            </div>
          )}
        </div>
      </section>

      <section className='space-y-5 rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6'>
        <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
          <span className='font-semibold text-slate-200'>Reels</span>
          <span>{matchingReels.length} results</span>
        </div>
        {matchingReels.length ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {matchingReels.map(reel => (
              <button
                key={reel._id}
                type='button'
                onClick={() => setActiveReel(reel)}
                className='group overflow-hidden rounded-3xl border border-violet-500/30 bg-slate-950/60 shadow-lg shadow-violet-500/20 transition hover:border-violet-400/40 hover:shadow-violet-500/40'
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
                      <Avatar className='h-8 w-8 border border-slate-900/80'>
                        <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                        <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col text-left'>
                        <span className='text-xs font-semibold text-slate-50'>{reel.author?.username}</span>
                        <span className='text-[11px] text-slate-400'>{reel.views?.length || 0} views</span>
                      </div>
                    </div>
                    <span className='inline-flex items-center gap-2 self-end rounded-full bg-violet-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-200'>
                      <PlayCircle className='h-3.5 w-3.5' />
                      Watch
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className='rounded-2xl border border-slate-800/60 bg-slate-950/60 p-8 text-center text-sm text-slate-500'>
            No reels match that search yet. Try another creator or vibe.
          </div>
        )}
      </section>

      {!normalizedQuery && user && (
        <div className='rounded-3xl border border-slate-800/60 bg-gradient-to-r from-sky-500/10 via-emerald-400/5 to-indigo-500/10 p-6 text-sm text-slate-300'>
          <h2 className='text-base font-semibold text-slate-100'>Search tips</h2>
          <ul className='mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2'>
            <li>Look up friends by their @handle or name.</li>
            <li>Search captions to revisit moments you loved.</li>
            <li>Use broad words like &ldquo;travel&rdquo; or &ldquo;design&rdquo; to find inspiration.</li>
            <li>Tap any result to jump straight into the conversation.</li>
          </ul>
        </div>
      )}
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

export default Search
