'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { HeaderNotifications } from "@/components/dashboard/header-notifications"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userInitial, setUserInitial] = useState<string>("U")
  const [activeUsersCount, setActiveUsersCount] = useState<number>(1)

  useEffect(() => {
    const supabase = createClient()

    const setupAuthAndPresence = async () => {
      // 1. Obtener la inicial del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const name = user.user_metadata?.name || user.email || "Usuario"
        setUserInitial(name.charAt(0).toUpperCase())

        // 2. Suscribirse a Supabase Realtime Presence para contar usuarios activos en tiempo real
        const channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: user.id,
            },
          },
        })

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState()
            // Contar llaves únicas de usuarios conectados en tiempo real
            const count = Object.keys(state).length
            setActiveUsersCount(count > 0 ? count : 1)
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({
                email: user.email,
                online_at: new Date().toISOString(),
              })
            }
          })

        return () => {
          supabase.removeChannel(channel)
        }
      }
    }

    setupAuthAndPresence()
  }, [])

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
              
              {/* Premium user badge & Real-time Active Session Counter */}
              <div className="flex items-center gap-2.5">
                {/* Active Sessions Counter Pill */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                    {activeUsersCount} {activeUsersCount === 1 ? 'Activo' : 'Activos'}
                  </span>
                </div>

                {/* Dynamic User Initials Badge */}
                <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-extrabold text-xs uppercase shadow-inner select-none transition-all duration-300">
                  {userInitial}
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
