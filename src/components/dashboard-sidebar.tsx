'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Building2, Bell, LogOut, UserCog, CreditCard, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authController } from "@/controllers/auth.controller"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: UserCog,
  },
  {
    title: "Sociedades",
    url: "/dashboard/sociedades",
    icon: Building2,
  },
  {
    title: "Pagos",
    url: "/dashboard/pagos",
    icon: CreditCard,
  },
  {
    title: "Recordatorios",
    url: "/dashboard/recordatorios",
    icon: Bell,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserRole(user.user_metadata?.role || 'empleado')
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const result = await authController.handleLogout()
    if (result.success) {
      router.push('/login')
    }
  }

  const filteredItems = items.filter(item => {
    if (item.url === '/dashboard/usuarios') {
      return userRole === 'admin'
    }
    return true
  })

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-background/30 backdrop-blur-md">
      <SidebarHeader className="flex items-center gap-2 p-4 border-b border-white/5 justify-center">
        <div className="flex items-center gap-3 w-full justify-center">
          {/* Logo expandido (SVG Dinámico que cambia según el tema) */}
          <div className="flex items-center justify-center py-1 px-1 group-data-[collapsible=icon]:hidden w-full transition-all duration-300">
            <svg viewBox="0 0 500 220" className="w-full h-auto max-w-[170px]">
              <defs>
                <style>{`
                  .gold-brand { fill: #CBA135; font-family: 'Times New Roman', Georgia, serif; font-weight: bold; }
                  .divider-line { stroke: #CBA135; stroke-width: 2; }
                  .theme-text { 
                    font-family: 'Times New Roman', Georgia, serif; 
                    letter-spacing: 3px;
                    fill: #FFFFFF; /* Blanco puro por defecto (para Obsidian Gold y Midnight Emerald) */
                    transition: fill 0.4s ease;
                  }
                  /* En el tema claro Arctic Slate, las letras cambian al color primario del tema */
                  :root.theme-arctic-slate .theme-text {
                    fill: var(--primary);
                  }
                `}</style>
              </defs>

              <text x="250" y="70" fontSize="64" textAnchor="middle" className="gold-brand">
                EIP <tspan fontStyle="italic" fontWeight="normal" fontSize="50">&amp;</tspan>
              </text>

              <text x="250" y="140" fontSize="42" textAnchor="middle" className="theme-text" fontWeight="normal">
                ASSOCIATES
              </text>

              <line x1="50" y1="160" x2="450" y2="160" className="divider-line" />

              <text x="250" y="200" fontSize="20" textAnchor="middle" className="theme-text" fontWeight="normal" letterSpacing="4">
                ATTORNEYS AT LAW
              </text>
            </svg>
          </div>

          {/* Logo colapsado (modo icono que también adopta el color del tema primario) */}
          <div className="hidden group-data-[collapsible=icon]:flex h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 items-center justify-center shadow-lg shadow-amber-500/20 border border-white/10 transition-all duration-300 hover:scale-105">
            <span className="text-black font-extrabold text-base tracking-tighter">EIP</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarMenu className="gap-1.5">
          {filteredItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  className={`w-full relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 cursor-pointer font-medium ${isActive
                    ? 'text-foreground bg-primary/10 border-l-2 border-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  render={<Link href={item.url} />}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-250 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all duration-250 font-medium"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
