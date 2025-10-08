import ReelCard from './ReelCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const ReelPlayerDialog = ({ reel, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl overflow-hidden border border-[rgba(0,0,0,0.05)] bg-white/90 p-0 text-[#4a4a4a] shadow-[0_32px_80px_-58px_rgba(200,169,241,0.55)]'>
        <DialogHeader className='border-b border-[rgba(0,0,0,0.05)] bg-white/80 px-6 py-4'>
          <DialogTitle className='text-base font-semibold text-[#333333]'>Reel preview</DialogTitle>
        </DialogHeader>
        <div className='max-h-[80vh] overflow-y-auto p-6'>
          {reel ? (
            <ReelCard reel={reel} />
          ) : (
            <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f]'>
              Choose a reel to watch in full.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReelPlayerDialog
