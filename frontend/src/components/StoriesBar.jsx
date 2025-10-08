import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import StoryComposer from './StoryComposer'
import StoryViewer from './StoryViewer'

const StoryBubble = ({ story, label, onClick }) => {
  return (
    <button onClick={() => onClick(story)} className='flex flex-col items-center gap-2 focus:outline-none'>
      <div className='rounded-full bg-gradient-to-tr from-sky-500 via-emerald-400 to-indigo-500 p-[2px] transition hover:scale-105'>
        <Avatar className='h-16 w-16 border-4 border-slate-950/80'>
          <AvatarImage src={story?.owner?.profilePicture} alt={story?.owner?.username} />
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
      </div>
      <span className='text-xs text-slate-400'>{label}</span>
    </button>
  )
}

const StoriesBar = () => {
  const { myStories, stories, isLoading } = useSelector(store => store.story)
  const { user } = useSelector(store => store.auth)
  const [activeStory, setActiveStory] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const orderedStories = useMemo(() => {
    return [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [stories])

  const openStory = (story) => {
    if (!story) return
    setActiveStory(story)
    setViewerOpen(true)
  }

  return (
    <div className='rounded-[2rem] border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-slate-100'>Stories</h2>
          <p className='text-xs text-slate-400'>Capture a 24-hour highlight for your circle.</p>
        </div>
        <div className='w-full sm:w-40'>
          <StoryComposer />
        </div>
      </div>
      {isLoading ? (
        <div className='py-6 text-center text-sm text-slate-400'>Loading stories...</div>
      ) : (
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {myStories.length > 0 ? (
            myStories.map((story) => (
              <StoryBubble
                key={story._id}
                story={story}
                label='Your story'
                onClick={openStory}
              />
            ))
          ) : (
            <div className='flex flex-col items-center justify-center text-xs text-slate-500'>
              <Avatar className='mb-1 h-16 w-16 border border-slate-900'>
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>YOU</AvatarFallback>
              </Avatar>
              <span>Create a story to share</span>
            </div>
          )}
          {orderedStories.map((story) => (
            <StoryBubble
              key={story._id}
              story={story}
              label={story.owner?.username}
              onClick={openStory}
            />
          ))}
        </div>
      )}
      <StoryViewer story={activeStory} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  )
}

export default StoriesBar
