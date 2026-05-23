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
      <SidebarHeader className="flex items-center gap-2 p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-wider text-foreground font-heading">EIP & ASSOC</span>
            <span className="text-[10px] text-muted-foreground/85 font-semibold tracking-wider uppercase">CRM ENTERPRISE</span>
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
                  className={`w-full relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 cursor-pointer font-medium ${
                    isActive 
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
