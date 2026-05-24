'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export interface AnalyticsChartsProps {
  data: {
    paymentsByMonth: Array<{ month: string; cantidad: number; monto: number }>
    complianceStats: Array<{ name: string; value: number }>
  }
}

const COMPLIANCE_COLORS = {
  'Al Día': '#10b981',           // Emerald
  'Próximos a Vencer': '#f59e0b', // Amber
  'Vencidos': '#f43f5e',          // Rose
}

const CustomPaymentsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-panel border border-white/10 p-3 rounded-xl bg-black/90 shadow-2xl backdrop-blur-md">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
        <p className="text-sm font-bold text-amber-400 font-heading">
          Recaudado: <span className="text-foreground">${data.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="text-[10px] font-bold text-muted-foreground mt-1">
          Transacciones: <span className="text-foreground">{data.cantidad} cobros</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomComplianceTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-panel border border-white/10 p-3 rounded-xl bg-black/90 shadow-2xl backdrop-blur-md">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{data.name}</p>
        <p className="text-sm font-bold text-primary font-heading">
          Sociedades: <span className="text-foreground">{data.value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { paymentsByMonth = [], complianceStats = [] } = data || {}

  // Sumar total de cobros para leyenda explicativa
  const totalComplianceVal = complianceStats.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Gráfico Izquierdo: Cobros por Mes */}
      <Card className="glass-panel border border-white/5 bg-black/25 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold tracking-tight text-foreground font-heading">Cobros Registrados por Mes</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-semibold">Tendencia de actividad financiera y cobro de tasas administrativas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] p-6 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={paymentsByMonth}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                className="text-[9px] font-bold uppercase tracking-wider" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)' }} 
              />
              <YAxis 
                className="text-[9px] font-bold" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)' }} 
                tickFormatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              />
              <Tooltip content={<CustomPaymentsTooltip />} />
              <Area 
                type="monotone" 
                dataKey="monto" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaMonto)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico Derecho: Estado de Cumplimiento */}
      <Card className="glass-panel border border-white/5 bg-black/25 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold tracking-tight text-foreground font-heading">Estado de Cumplimiento</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-semibold">Salud administrativa y tasas vigentes de sociedades activas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] p-6 pt-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-3/5 h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  animationDuration={1200}
                >
                  {complianceStats.map((entry: any, index: number) => {
                    const color = COMPLIANCE_COLORS[entry.name as keyof typeof COMPLIANCE_COLORS] || '#64748b'
                    return (
                      <Cell key={`cell-${index}`} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={2.5} />
                    )
                  })}
                </Pie>
                <Tooltip content={<CustomComplianceTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total Indicator inside the donut hole */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sociedades</span>
              <span className="text-2xl font-black text-foreground font-heading">{totalComplianceVal}</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="w-full md:w-2/5 flex flex-col gap-3.5 pr-2">
            {complianceStats.map((entry: any, index: number) => {
              const color = COMPLIANCE_COLORS[entry.name as keyof typeof COMPLIANCE_COLORS] || '#64748b'
              const percent = totalComplianceVal > 0 ? (entry.value / totalComplianceVal) * 100 : 0
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-foreground">{entry.value}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/60 ml-1.5">({percent.toFixed(0)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
