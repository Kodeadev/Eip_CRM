'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Building, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export function PaymentsTable({ data }: { data: any[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const router = useRouter()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'societies.internal_id',
      header: 'ID',
      cell: ({ row }) => {
        const society = row.original.societies
        return <div className="text-muted-foreground font-semibold text-xs">{society?.internal_id || '-'}</div>
      },
    },
    {
      accessorKey: 'societies.name',
      header: 'Sociedad',
      cell: ({ row }) => {
        const society = row.original.societies
        return <div className="font-bold text-foreground">{society?.name || 'Desconocida'}</div>
      },
    },
    {
      accessorKey: 'payment_date',
      header: 'Fecha de Pago',
      cell: ({ row }) => {
        const dateStr = row.getValue('payment_date')
        return <span className="text-foreground/90 font-medium">{dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : 'N/D'}</span>
      },
    },
    {
      accessorKey: 'next_due_date',
      header: 'Próximo Vencimiento',
      cell: ({ row }) => {
        const nextDate = new Date(row.getValue('next_due_date'))
        const today = new Date()
        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        let colorClass = 'text-emerald-400 font-semibold'
        let bgClass = 'bg-emerald-500/10 border-emerald-500/20'
        if (diffDays < 0) {
          colorClass = 'text-rose-400 font-bold animate-pulse'
          bgClass = 'bg-rose-500/10 border-rose-500/20'
        } else if (diffDays <= 30) {
          colorClass = 'text-amber-400 font-semibold'
          bgClass = 'bg-amber-500/10 border-amber-500/20'
        }

        return (
          <div className={`inline-flex flex-col border px-3 py-1.5 rounded-xl ${bgClass}`}>
            <span className={colorClass}>{format(nextDate, 'dd/MM/yyyy')}</span>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">
              {diffDays < 0 ? `Vencido hace ${Math.abs(diffDays)} días` : `En ${diffDays} días`}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        return <span className="font-bold text-foreground">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      },
    },
    {
      accessorKey: 'payment_method',
      header: 'Método',
      cell: ({ row }) => <span className="capitalize text-foreground/90 font-semibold text-xs bg-black/5 dark:bg-white/5 border border-border px-2 py-0.5 rounded-lg">{row.getValue('payment_method') || 'N/D'}</span>,
    },
    {
      id: 'acciones',
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/sociedades/${payment.society_id}`)}
              className="h-8 flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border rounded-lg cursor-pointer transition"
            >
              <Building className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Ver Sociedad</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/pagos/${payment.id}/editar`)}
              className="h-8 flex items-center gap-1.5 border-border hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition"
            >
              <Edit className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Editar</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
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
                  data-state={row.getIsSelected() && 'selected'}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 font-semibold">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground rounded-lg text-xs font-bold uppercase tracking-wider px-4 h-9 cursor-pointer disabled:opacity-40"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground rounded-lg text-xs font-bold uppercase tracking-wider px-4 h-9 cursor-pointer disabled:opacity-40"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
