import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Search, Sparkles } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import { Button } from './ui/button'
import { Input } from './ui/input'

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c8a9f1]/35 via-[#f6f6f6] to-[#f8c8a3]/25 text-[#333333]">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-12%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#c8a9f1]/30 via-transparent to-[#f8c8a3]/20 blur-[140px]" />
          <div className="absolute right-[8%] bottom-[-18%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-[#f8c8a3]/25 via-transparent to-[#c8a9f1]/20 blur-[160px]" />
        </div>
        <header className="sticky top-0 z-30 border-b border-[rgba(0,0,0,0.05)] bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_-25px_rgba(51,51,51,0.45)]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden border border-[rgba(0,0,0,0.08)] bg-white/80 text-[#4a4a4a] shadow-sm"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-white/80 px-4 py-2 shadow-[0_20px_45px_-40px_rgba(200,169,241,0.8)]">
                <Sparkles className="h-5 w-5 text-[#c8a9f1]" />
                <span className="font-semibold tracking-tight text-[#4a4a4a]">NovaSphere</span>
              </div>
            </div>
            <div className="hidden flex-1 items-center gap-2 lg:flex">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8b8b8]" />
                <Input
                  placeholder="Search people, tags, or spaces"
                  className="w-full border-[rgba(0,0,0,0.06)] bg-white/90 pl-10 text-[#333333] placeholder:text-[#b8b8b8]"
                  onFocus={() => navigate('/search')}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCreatePostOpen(true)} className="hidden lg:inline-flex">
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
