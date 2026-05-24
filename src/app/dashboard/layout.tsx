'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { HeaderNotifications } from "@/components/dashboard/header-notifications"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full ambient-layout">
        {/* Cinematic Backdrop Ambient Illumination */}
        <div className="ambient-orb-top" />
        <div className="ambient-orb-bottom" />

        <DashboardSidebar />

        <SidebarInset className="flex-1 flex flex-col bg-transparent relative z-10 min-w-0 w-full overflow-hidden">
          <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 border-b border-border bg-background/20 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground cursor-pointer" />
              <div className="h-4 w-[1px] bg-border" />
              <span className="text-xs sm:text-sm font-bold tracking-widest bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent font-heading hidden xs:inline sm:inline">
                EIP & ASSOCIATES
              </span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Floating Slide Theme switcher */}
              <ThemeSwitcher />

              {/* Quick notification panel trigger */}
              <HeaderNotifications />

              <div className="h-4 w-[1px] bg-border" />
              
              {/* Premium user badge */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-inner">
                  A
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-w-0 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
