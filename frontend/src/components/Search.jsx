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
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white/80 p-8 text-[#4a4a4a] shadow-[0_32px_80px_-60px_rgba(51,51,51,0.6)] backdrop-blur-xl'>
      <div className='space-y-3'>
        <h1 className='text-2xl font-semibold text-[#333333]'>Search NovaSphere</h1>
        <p className='text-sm text-[#6f6f6f]'>Find creators, communities, and posts tailored to your vibe.</p>
        <div className='relative'>
          <SearchIcon className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8b8b8]' />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search for people or captions'
            className='h-12 rounded-full border-[rgba(0,0,0,0.06)] bg-white/90 pl-11 text-[#333333] placeholder:text-[#b8b8b8]'
          />
        </div>
      </div>

      <section className='grid gap-10 lg:grid-cols-[260px_1fr]'>
        <div className='space-y-5 rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-5 shadow-[0_24px_60px_-52px_rgba(51,51,51,0.45)]'>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-[#8c8c8c]'>
            <span className='font-semibold text-[#4a4a4a]'>People</span>
            <span>{matchingPeople.length} results</span>
          </div>
          <div className='flex flex-col gap-3'>
            {matchingPeople.length ? (
              matchingPeople.map(person => (
                <Link
                  key={person._id}
                  to={`/profile/${person._id}`}
                  className='group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-[rgba(0,0,0,0.08)] hover:bg-white'
                >
                  <Avatar className='h-10 w-10 border border-[rgba(0,0,0,0.05)] bg-white'>
                    <AvatarImage src={person.profilePicture} alt={person.username} />
                    <AvatarFallback>{person.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium text-[#333333] group-hover:text-[#4a4a4a]'>{person.username}</span>
                    <span className='text-xs text-[#8c8c8c]'>{person.bio || 'New to the community'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/70 px-4 py-6 text-center text-sm text-[#6f6f6f] shadow-[0_20px_45px_-40px_rgba(51,51,51,0.4)]'>
                No people matched your search yet. Try a different name or keyword.
              </div>
            )}
          </div>
        </div>

        <div className='space-y-5'>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-[#8c8c8c]'>
            <span className='font-semibold text-[#4a4a4a]'>Posts & captions</span>
            <span>{matchingPosts.length} results</span>
          </div>
          {matchingPosts.length ? (
            <div className='grid gap-4 sm:grid-cols-2'>
              {matchingPosts.map(post => (
                <article
                  key={post._id}
                  className='group flex flex-col overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/80 shadow-[0_28px_60px_-48px_rgba(51,51,51,0.55)] transition hover:border-[rgba(0,0,0,0.08)] hover:shadow-[0_32px_72px_-50px_rgba(200,169,241,0.6)]'
                >
                  <Link to={`/p/${post._id}`} className='relative block'>
                    <img src={post.image} alt={post.caption} className='aspect-square w-full object-cover' />
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100' />
                  </Link>
                  <div className='flex flex-1 flex-col gap-3 p-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-9 w-9 border border-[rgba(0,0,0,0.05)] bg-white'>
                        <AvatarImage src={post.author?.profilePicture} alt={post.author?.username} />
                        <AvatarFallback>{post.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm font-semibold text-[#333333]'>{post.author?.username}</span>
                        <span className='text-xs text-[#8c8c8c]'>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className='text-sm leading-5 text-[#4a4a4a]'>{post.caption || 'Shared a new moment'}</p>
                    <div className='mt-auto flex flex-wrap gap-2'>
                      <Button
                        variant='secondary'
                        className='rounded-full bg-[#e8d6c6] text-[#4a4a4a] hover:bg-[#ddc4b0]'
                        asChild
                      >
                        <Link to={`/p/${post._id}`}>View post</Link>
                      </Button>
                      <Button
                        variant='ghost'
                        className='rounded-full border border-transparent text-[#6f6f6f] hover:text-[#333333]'
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
            <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f] shadow-[0_24px_60px_-48px_rgba(51,51,51,0.45)]'>
              No posts matched your search. Try different keywords or explore trending topics.
            </div>
          )}
        </div>
      </section>

      <section className='space-y-5 rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-6 shadow-[0_24px_60px_-52px_rgba(51,51,51,0.45)]'>
        <div className='flex items-center justify-between text-xs uppercase tracking-wide text-[#8c8c8c]'>
          <span className='font-semibold text-[#4a4a4a]'>Reels</span>
          <span>{matchingReels.length} results</span>
        </div>
        {matchingReels.length ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {matchingReels.map(reel => (
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
                      <Avatar className='h-8 w-8 border border-[rgba(255,255,255,0.6)]'>
                        <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                        <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'NS'}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col text-left'>
                        <span className='text-xs font-semibold text-white'>{reel.author?.username}</span>
                        <span className='text-[11px] text-white/80'>{reel.views?.length || 0} views</span>
                      </div>
                    </div>
                    <span className='inline-flex items-center gap-2 self-end rounded-full bg-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white'>
                      <PlayCircle className='h-3.5 w-3.5' />
                      Watch
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-8 text-center text-sm text-[#6f6f6f] shadow-[0_22px_50px_-46px_rgba(51,51,51,0.45)]'>
            No reels match that search yet. Try another creator or vibe.
          </div>
        )}
      </section>

      {!normalizedQuery && user && (
        <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-gradient-to-r from-[#c8a9f1]/20 via-[#e8d6c6]/25 to-[#f8c8a3]/20 p-6 text-sm text-[#4a4a4a] shadow-[0_24px_60px_-52px_rgba(200,169,241,0.45)]'>
          <h2 className='text-base font-semibold text-[#333333]'>Search tips</h2>
          <ul className='mt-3 grid gap-2 text-xs text-[#6f6f6f] sm:grid-cols-2'>
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
