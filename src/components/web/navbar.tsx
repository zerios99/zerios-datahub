import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="/tanstack-circle-logo.png"
            alt="tanstack logo"
            className="size-9"
          />
          <h1 className="text-lg font-semibold">Tanstack Start</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant={'secondary'}>Login</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  )
}
