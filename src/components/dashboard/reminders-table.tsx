'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Eye, Check, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { handleUpdateReminderStatus } from '@/controllers/dashboard.controller'

export function RemindersTable({ data }: { data: any[] }) {
  const router = useRouter()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'societies.name',
      header: 'Sociedad',
      cell: ({ row }) => <div className="font-semibold text-foreground">{row.original.societies?.name || 'N/D'}</div>,
    },
    {
      accessorKey: 'title',
      header: 'Concepto',
      cell: ({ row }) => <div className="text-foreground/90 font-medium">{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'due_date',
      header: 'Fecha Vencimiento',
      cell: ({ row }) => <div className="text-muted-foreground text-xs font-semibold">{row.getValue('due_date')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = (row.getValue('status') as string || '').toLowerCase()
        const isPaid = status === 'paid' || status === 'pagado'
        const isOverdue = status === 'overdue' || status === 'vencido'
        const isUpcoming = status === 'upcoming' || status === 'próximo'
        
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
            isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            isOverdue ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
            isUpcoming ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {isPaid ? 'Pagado' : isOverdue ? 'Vencido' : isUpcoming ? 'Próximo' : 'Pendiente'}
          </span>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Prioridad',
      cell: ({ row }) => {
        const priority = (row.getValue('priority') as string || '').toLowerCase()
        const isCritical = priority === 'critical' || priority === 'urgente'
        const isHigh = priority === 'high' || priority === 'alta'
        const isMedium = priority === 'medium' || priority === 'media'
        
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
            isCritical ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
            isHigh ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
            isMedium ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
            'bg-blue-500/15 text-blue-400 border-blue-500/30'
          }`}>
            {isCritical ? 'Crítica' : isHigh ? 'Alta' : isMedium ? 'Media' : 'Baja'}
          </span>
        )
      },
    },
    {
      id: 'acciones',
      cell: ({ row }) => {
        const reminder = row.original

        const updateStatus = async (status: string) => {
          const result = await handleUpdateReminderStatus(reminder.id, status)
          if (result.success) {
            router.refresh()
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border border-white/10 bg-black/90 text-slate-200">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/sociedades/${reminder.society_id}`)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg text-sm">
                  <Eye className="h-4 w-4" /> Ver sociedad
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => updateStatus('paid')} className="flex items-center gap-2 cursor-pointer text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-sm">
                  <Check className="h-4 w-4" /> Marcar como pagado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus('cancelled')} className="flex items-center gap-2 cursor-pointer text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm">
                  <X className="h-4 w-4" /> Cancelar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-xl border border-white/5 bg-transparent overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.02] border-b border-white/5">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-white/5 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground/80 font-medium">
                No hay cobros próximos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
