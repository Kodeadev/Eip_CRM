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
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Eye, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function SocietiesTable({ data }: { data: any[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const router = useRouter()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'internal_id',
      header: 'ID',
      cell: ({ row }) => <div className="text-muted-foreground font-semibold text-xs">{row.getValue('internal_id') || '-'}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => <div className="font-bold text-foreground">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'ruc',
      header: 'RUC',
      cell: ({ row }) => <div className="text-foreground/90 font-medium text-xs">{row.getValue('ruc')}</div>,
    },
    {
      accessorKey: 'dv',
      header: 'DV',
      cell: ({ row }) => <div className="font-mono text-center max-w-[40px] text-xs bg-black/5 dark:bg-white/5 border border-border px-2 py-0.5 rounded text-foreground/90">{row.getValue('dv') || '-'}</div>,
    },
    {
      accessorKey: 'legal_representative',
      header: 'Representante',
      cell: ({ row }) => <div className="text-foreground/90 font-medium">{row.getValue('legal_representative') || 'N/D'}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = (row.getValue('status') as string || '').toLowerCase()
        const isActive = status === 'activa' || status === 'active'
        const isSuspended = status === 'suspendida' || status === 'suspended'
        const isPending = status === 'en trámite' || status === 'pending'
        
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
            isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            isSuspended ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
            isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'next_payment_date',
      header: 'Próximo Cobro',
      cell: ({ row }) => <div className="text-muted-foreground text-xs font-semibold">{row.getValue('next_payment_date') || 'N/D'}</div>,
    },
    {
      id: 'acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const society = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition cursor-pointer">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border border-white/10 bg-black/90 text-slate-200">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/sociedades/${society.id}`)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg text-sm">
                  <Eye className="h-4 w-4" /> Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/sociedades/${society.id}/editar`)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg text-sm">
                  <Edit className="h-4 w-4" /> Editar
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer rounded-lg text-sm">
                  <Trash className="h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Filter logic
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data
    return data.filter(item => {
      const name = (item.name || '').toLowerCase()
      const ruc = (item.ruc || '').toLowerCase()
      const rep = (item.legal_representative || '').toLowerCase()
      const query = globalFilter.toLowerCase()
      return name.includes(query) || ruc.includes(query) || rep.includes(query)
    })
  }, [data, globalFilter])

  const table = useReactTable({
    data: filteredData,
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="Buscar sociedades por nombre, RUC..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-11 h-11 bg-card/40 border border-border text-foreground rounded-xl focus:border-primary focus:bg-card/70 transition-all duration-200"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-transparent overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.02] border-b border-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={cn("text-xs font-bold text-muted-foreground uppercase tracking-wider py-4", header.column.getCanSort() && "p-0")}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-2 w-full h-full px-4 text-left font-bold select-none hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors cursor-pointer py-4"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />,
                            desc: <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0" />,
                          }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        </button>
                      ) : (
                        <div className="px-4">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-semibold">
                  No hay sociedades constituidas que coincidan.
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
