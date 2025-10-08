import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Search, Sparkles } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import { Button } from './ui/button'
import { Input } from './ui/input'

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [createPostOpen, setCreatePostOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="absolute right-[10%] bottom-[-15%] h-[420px] w-[420px] rounded-full bg-emerald-400/20 blur-[140px]" />
        </div>
        <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden bg-slate-900/80 text-slate-100 border border-slate-800/80"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 px-4 py-2 shadow-lg shadow-sky-500/5">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <span className="font-semibold tracking-tight text-slate-50">NovaSphere</span>
              </div>
            </div>
            <div className="hidden flex-1 items-center gap-2 lg:flex">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search people, tags, or spaces"
                  className="w-full border-slate-800 bg-slate-900/70 pl-10 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setCreatePostOpen(true)}
                className="hidden bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/40 hover:from-sky-400 hover:to-emerald-300 lg:inline-flex"
              >
                Share a moment
              </Button>
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <LeftSidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
            createOpen={createPostOpen}
            onCreateOpenChange={setCreatePostOpen}
          />
          <main className="flex min-h-[calc(100vh-120px)] flex-1 flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
