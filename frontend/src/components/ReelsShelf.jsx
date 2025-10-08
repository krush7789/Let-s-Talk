import { useSelector } from 'react-redux'
import ReelComposer from './ReelComposer'
import ReelCard from './ReelCard'

const ReelsShelf = () => {
  const { reels, isLoading } = useSelector(store => store.reel)

  return (
    <div className='rounded-[2rem] border border-[rgba(0,0,0,0.05)] bg-white/80 p-6 text-[#4a4a4a] shadow-[0_24px_60px_-48px_rgba(51,51,51,0.45)] backdrop-blur-xl'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-[#333333]'>Reels</h2>
          <p className='text-xs text-[#8c8c8c]'>Vertical stories from your creative circles.</p>
        </div>
        <ReelComposer />
      </div>
      {isLoading ? (
        <div className='py-10 text-center text-sm text-[#8c8c8c]'>Loading reels...</div>
      ) : reels.length === 0 ? (
        <div className='py-10 text-center text-sm text-[#8c8c8c]'>No reels yet. Be the first to share!</div>
      ) : (
        <div className='flex flex-col gap-6'>
          {reels.map(reel => <ReelCard key={reel._id} reel={reel} />)}
        </div>
      )}
    </div>
  )
}

export default ReelsShelf
