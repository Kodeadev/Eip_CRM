'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema, PaymentInput } from '@/validators/payment'
import { z } from 'zod'
import { handleCreatePayment, handleUpdatePayment } from '@/controllers/payment.controller'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft, Check, ChevronsUpDown, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCatalogs } from '@/hooks/use-catalogs'
import { DocumentUploader } from '@/components/societies/document-uploader'

export function PaymentForm({ societies, initialData }: { societies: any[], initialData?: any }) {
  const { paymentMethods } = useCatalogs()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openCombobox, setOpenCombobox] = useState(false)
  const router = useRouter()

  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      payment_date: new Date().toISOString().split('T')[0], // Hoy
      next_due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año después
      amount: 300, // Valor típico por defecto
      payment_method: 'transferencia',
    },
  })

  const selectedSocietyId = watch('society_id')
  const selectedSociety = societies.find(s => s.id === selectedSocietyId)

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)

    const result = isEditing 
      ? await handleUpdatePayment(initialData.id, data)
      : await handleCreatePayment(data)

    if (result.success) {
      router.push('/dashboard/pagos')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pagos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Registrar Nuevo Cobro</h1>
          <p className="text-muted-foreground">Registre el pago de tasa anual y actualice automáticamente el próximo vencimiento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {isEditing ? 'Editar Cobro' : 'Registrar Nuevo Cobro'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Modifica los detalles del cobro existente.' : 'Ingresa los detalles del pago de tasa anual u otros servicios.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Buscador de Sociedad */}
            <div className="space-y-2 col-span-2">
              <Label>Sociedad <span className="text-red-500">*</span></Label>
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          disabled={isEditing}
                          className={cn(
                            "w-full justify-between h-12 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      {field.value
                        ? societies.find((s) => s.id === field.value)?.name
                        : "Buscar sociedad..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o ID interno..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ninguna sociedad.</CommandEmpty>
                          <CommandGroup>
                            {societies.map((society) => (
                              <CommandItem
                                key={society.id}
                                value={society.name + " " + (society.internal_id || "")}
                                onSelect={() => {
                                  field.onChange(society.id)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === society.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{society.name}</span>
                                  <span className="text-xs text-muted-foreground">ID: {society.internal_id || 'N/A'} - RUC: {society.ruc || 'N/A'}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.society_id && <p className="text-xs text-red-500">{errors.society_id.message}</p>}
            </div>

            {/* Ficha de Información Relevante (Solo aparece al seleccionar) */}
            {selectedSociety && (
              <div className="col-span-2 bg-slate-50 dark:bg-slate-900 border rounded-md p-4 flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">ID Interno</span>
                  <span className="font-medium">{selectedSociety.internal_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Último Pago</span>
                  <span className="font-medium">{selectedSociety.last_payment_date || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Vencimiento Actual</span>
                  <span className="font-medium text-amber-600">{selectedSociety.next_payment_date || 'No registrado'}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_date">Fecha de Cobro Realizado <span className="text-red-500">*</span></Label>
              <Input 
                id="payment_date" 
                type="date" 
                className="h-11"
                {...register('payment_date')} 
                onChange={(e) => {
                  // Si cambia la fecha de pago, sugerir la fecha del próximo año automáticamente
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    setValue('next_due_date', newDate.toISOString().split('T')[0]);
                  }
                  setValue('payment_date', e.target.value);
                }}
              />
              {errors.payment_date && <p className="text-xs text-red-500">{errors.payment_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Sugerencia Próximo Vencimiento <span className="text-red-500">*</span></Label>
              <Input id="next_due_date" type="date" className="h-11 bg-primary/5 border-primary/20" {...register('next_due_date')} />
              <p className="text-xs text-muted-foreground">Esta fecha actualizará el panel de recordatorios.</p>
              {errors.next_due_date && <p className="text-xs text-red-500">{errors.next_due_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto Cobrado (USD)</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, value, ref } }) => {
                  const formatValue = (val: any) => {
                    if (val === undefined || val === null || val === '') return '';
                    let rawValue = val.toString().replace(/[^0-9.]/g, '');
                    const parts = rawValue.split('.');
                    if (parts.length > 2) {
                      rawValue = parts[0] + '.' + parts.slice(1).join('');
                    }
                    if (rawValue) {
                      const [integerPart, decimalPart] = rawValue.split('.');
                      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                      return decimalPart !== undefined 
                        ? `${formattedInteger}.${decimalPart}`
                        : formattedInteger;
                    }
                    return '';
                  };
                  const displayValue = formatValue(value);
                  return (
                    <Input 
                      id="amount" 
                      type="text" 
                      className="h-11"
                      ref={ref}
                      value={displayValue}
                      onChange={(e) => {
                        let rawValue = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = rawValue.split('.');
                        if (parts.length > 2) {
                          rawValue = parts[0] + '.' + parts.slice(1).join('');
                        }
                        if (rawValue) {
                          const [integerPart, decimalPart] = rawValue.split('.');
                          const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                          const finalValue = decimalPart !== undefined 
                            ? `${formattedInteger}.${decimalPart}`
                            : formattedInteger;
                          onChange(finalValue);
                        } else {
                          onChange('');
                        }
                      }}
                      onBlur={(e) => {
                         let rawValue = e.target.value.replace(/[^0-9.]/g, '');
                         if (rawValue) {
                           const parsed = parseFloat(rawValue);
                           if (!isNaN(parsed)) {
                             const formatted = parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                             onChange(formatted);
                           }
                         }
                      }}
                    />
                  )
                }}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccione método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.name} value={method.name}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Observaciones Internas</Label>
              <Textarea 
                id="notes" 
                placeholder="Referencia bancaria, notas adicionales..." 
                className="resize-none h-24"
                {...register('notes')} 
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Comprobantes de Pago</Label>
              <DocumentUploader 
                bucketName="payment_documents" 
                onUploadComplete={(docs) => setValue('new_documents', docs)} 
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t flex justify-between p-6">
            <Link href="/dashboard/pagos" className={cn(buttonVariants({ variant: 'outline' }))}>
              Cancelar
            </Link>
            <Button type="submit" size="lg" disabled={loading} className="px-8">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Pago'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
