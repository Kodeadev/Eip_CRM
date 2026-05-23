'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#64748b']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-border p-3 rounded-xl bg-card/95 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-primary font-heading">
          {payload[0].name}: <span className="text-foreground">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function AnalyticsCharts({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="glass-panel border border-white/5 bg-black/25 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold tracking-tight text-foreground font-heading">Sociedades por Estado</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-medium">Distribución actual de sociedades activas e inactivas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] p-6 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" stroke="var(--border)" />
              <XAxis dataKey="name" className="text-[10px] font-semibold uppercase tracking-wider" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
              <YAxis className="text-[10px] font-semibold" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent)' }} />
              <Bar dataKey="value" fill="url(#barPrimary)" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donut Chart */}
      <Card className="glass-panel border border-white/5 bg-black/25 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold tracking-tight text-foreground font-heading">Distribución Porcentual</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-medium">Proporción por estado de constitución</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] p-6 pt-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={85}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
