'use client'

import { useTheme, Theme } from './theme-provider'
import { Sparkles, Shield, SunMoon } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const options: { id: Theme; name: string; color: string; icon: any }[] = [
    { id: 'obsidian-gold', name: 'Obsidian Gold', color: 'text-amber-500', icon: Sparkles },
    { id: 'arctic-slate', name: 'Arctic Slate', color: 'text-indigo-400', icon: SunMoon },
    { id: 'midnight-emerald', name: 'Midnight Emerald', color: 'text-emerald-400', icon: Shield },
  ]

  return (
    <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl backdrop-blur-md shadow-inner">
      {options.map((opt) => {
        const isActive = theme === opt.id
        const Icon = opt.icon
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            title={opt.name}
            className={`relative flex items-center justify-center p-2 rounded-lg transition duration-250 cursor-pointer ${
              isActive 
                ? 'text-white' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-bg"
                className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={`h-4 w-4 relative z-10 ${isActive ? opt.color : ''}`} />
          </button>
        )
      })}
    </div>
  )
}
