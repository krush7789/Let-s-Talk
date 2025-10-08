import ReelCard from './ReelCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const ReelPlayerDialog = ({ reel, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl overflow-hidden border border-slate-800/60 bg-slate-900/80 p-0 text-slate-100 shadow-xl shadow-violet-500/20'>
        <DialogHeader className='border-b border-slate-800/60 px-6 py-4'>
          <DialogTitle className='text-base font-semibold text-slate-100'>Reel preview</DialogTitle>
        </DialogHeader>
        <div className='max-h-[80vh] overflow-y-auto p-6'>
          {reel ? (
            <ReelCard reel={reel} />
          ) : (
            <div className='rounded-2xl border border-slate-800/60 bg-slate-950/60 p-10 text-center text-sm text-slate-400'>
              Choose a reel to watch in full.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReelPlayerDialog
