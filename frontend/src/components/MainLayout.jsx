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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-outline)] bg-[var(--color-surface-raised)]/95 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="lg:hidden border border-[var(--color-outline)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 py-1.5">
              <Sparkles className="h-5 w-5 text-[var(--color-primary-start)]" />
              <span className="font-semibold tracking-tight text-[var(--color-text)]">NovaSphere</span>
            </div>
          </div>
          <div className="hidden flex-1 items-center gap-2 lg:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0a0]" />
              <Input
                placeholder="Search people, tags, or spaces"
                className="w-full border-[var(--color-outline)] bg-[var(--color-surface)] pl-10 text-[var(--color-text)] placeholder:text-[#a0a0a0]"
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
      <div className="mx-auto flex w-full max-w-6xl gap-5 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
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
  )
}

export default MainLayout
