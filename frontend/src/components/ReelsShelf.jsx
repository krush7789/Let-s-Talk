import { useSelector } from 'react-redux'
import ReelComposer from './ReelComposer'
import ReelCard from './ReelCard'

const ReelsShelf = () => {
  const { reels, isLoading } = useSelector(store => store.reel)

  return (
    <div className='rounded-[2rem] border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl shadow-sky-500/10 backdrop-blur-xl'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-slate-100'>Reels</h2>
          <p className='text-xs text-slate-400'>Vertical stories from your creative circles.</p>
        </div>
        <ReelComposer />
      </div>
      {isLoading ? (
        <div className='py-10 text-center text-sm text-slate-400'>Loading reels...</div>
      ) : reels.length === 0 ? (
        <div className='py-10 text-center text-sm text-slate-400'>No reels yet. Be the first to share!</div>
      ) : (
        <div className='flex flex-col gap-6'>
          {reels.map(reel => <ReelCard key={reel._id} reel={reel} />)}
        </div>
      )}
    </div>
  )
}

export default ReelsShelf
