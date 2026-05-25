'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/validators/auth'
import { authController } from '@/controllers/auth.controller'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, User, Eye, EyeOff, Scale, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setError(null)
    const result = await authController.handleLogin(data)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? null)
      setLoading(false)
    }
  }

  return (
    <div className="theme-obsidian-gold dark flex min-h-screen w-full bg-[#070708] overflow-hidden relative font-sans text-slate-200">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] rounded-full bg-gradient-to-tr from-amber-500/10 via-emerald-500/5 to-transparent filter blur-[100px] pointer-events-none opacity-80" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vh] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent filter blur-[100px] pointer-events-none opacity-80" />

      {/* Grid Pattern Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_0)] bg-[size:32px_32px] pointer-events-none" />

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full z-10 relative">
        
        {/* Left Side: Cinematic Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 relative overflow-hidden border-r border-white/5">
          {/* Animated gradient mesh inside left panel */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent z-0" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Scale className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-widest text-white font-heading">EIP & ASSOCIATES</span>
          </div>

          <div className="space-y-6 max-w-xl my-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-amber-500 mb-6 tracking-wide uppercase">
                <Award className="h-3.5 w-3.5" /> Enterprise Legal Ecosystem v2.0
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
                Corporate Entity Management & Asset Protection.
              </h1>
              <p className="text-lg text-slate-400 mt-6 leading-relaxed">
                A highly sophisticated and automated digital ecosystem for real-time monitoring of annual fees, legal expirations, and critical notifications.
              </p>
            </motion.div>

            {/* Micro Feature badges */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
              <div>
                <div className="text-xl font-bold text-white font-heading">100%</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Automated</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white font-heading">Real-Time</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Synchronization</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white font-heading">Alerts</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">SMTP & Twilio</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 relative z-10 font-semibold tracking-wide">
            © {new Date().getFullYear()} EIP & Associates. All rights reserved.
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* Logo for mobile */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
              <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center">
                <Scale className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-wider text-white font-heading">EIP & ASSOCIATES</span>
            </div>

            <Card className="glass-panel border border-white/10 shadow-2xl relative overflow-hidden bg-black/45 rounded-2xl">
              {/* Card light overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

              <CardHeader className="space-y-2 p-8 pb-4">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white font-heading text-center">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm text-center font-medium">
                  Introduce tus credenciales autorizadas corporativas
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5 p-8 pt-4 pb-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl font-semibold flex items-center gap-2.5"
                    >
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      Usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500 transition-colors duration-200" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="ejemplo@eip.com"
                        className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white rounded-xl focus:border-amber-500 focus:bg-white/[0.05] transition-all duration-200"
                        {...register('username')}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-red-400 font-semibold">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                        Contraseña
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500 transition-colors duration-200" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-11 pr-11 h-12 bg-white/[0.03] border-white/10 text-white rounded-xl focus:border-amber-500 focus:bg-white/[0.05] transition-all duration-200"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 font-semibold">{errors.password.message}</p>
                    )}
                  </div>
                </CardContent>

                <div className="px-8 pb-8 pt-0 w-full block">
                  <Button 
                    type="submit" 
                    className="w-full h-12 glass-button-primary font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 rounded-xl active:scale-95 transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Autenticando...</span>
                      </div>
                    ) : (
                      'Entrar al Ecosistema'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
