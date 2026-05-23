'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { societySchema, SocietyInput } from '@/validators/society'
import { handleCreateSociety, handleGetNextInternalId } from '@/controllers/society.controller'
import { handleListUsers } from '@/controllers/user.controller'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Loader2, ArrowLeft, Upload, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCatalogs } from '@/hooks/use-catalogs'
import { DocumentUploader } from '@/components/societies/document-uploader'
import { PhoneInput } from '@/components/ui/phone-input'

export default function NuevaSociedadPage() {
  const { legalPersonTypes, societyStatuses, countries, positions } = useCatalogs()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usersList, setUsersList] = useState<any[]>([])
  const router = useRouter()

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<SocietyInput>({
    resolver: zodResolver(societySchema),
    defaultValues: {
      status: 'en trámite',
      registered_mici: false,
      registered_rubf: false,
      registered_dgi: false,
      additional_contacts: [],
      phone_country_prefix: '+507',
    }
  })

  const phoneCountryPrefix = watch('phone_country_prefix') || '+507'

  useEffect(() => {
    async function loadNextId() {
      const result = await handleGetNextInternalId()
      if (result.success && result.data) {
        setValue('internal_id', result.data)
      }
    }
    loadNextId()
  }, [setValue])

  useEffect(() => {
    async function loadUsers() {
      const result = await handleListUsers()
      if (result.success && result.data) {
        setUsersList(result.data)
      }
    }
    loadUsers()
  }, [])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additional_contacts"
  })

  const onSubmit = async (data: SocietyInput) => {
    setLoading(true)
    setError(null)
    const result = await handleCreateSociety(data)
    if (result.success) {
      router.push('/dashboard/sociedades')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sociedades" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Sociedad</h1>
          <p className="text-muted-foreground">Registra una nueva sociedad anónima en el sistema.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        {/* Sección 1: Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Datos básicos de la sociedad.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nombre de la Sociedad *</Label>
              <Input id="name" placeholder="Ej. Inversiones ABC, S.A." {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_id">Identificador Interno (Solo números)</Label>
              <Input id="internal_id" type="text" placeholder="Ej. 001" {...register('internal_id')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input id="ruc" placeholder="Ej. 1234567-1-123456" {...register('ruc')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dv">DV</Label>
              <Input id="dv" placeholder="Ej. 12" {...register('dv')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folio_number">Número de Folio</Label>
              <Input id="folio_number" placeholder="Ej. 123456" {...register('folio_number')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constitution_date">Fecha de Constitución</Label>
              <Input id="constitution_date" type="date" {...register('constitution_date')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {societyStatuses.map((status) => (
                        <SelectItem key={status.name} value={status.name}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_by">Usuario Creador / Asignado</Label>
              <Controller
                name="created_by"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                      <SelectValue placeholder="Selecciona el usuario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {usersList.map((usr) => (
                        <SelectItem key={usr.id} value={usr.id}>
                          {usr.name} ({usr.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.created_by && <p className="text-xs text-red-500">{errors.created_by.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Contacto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>Información de contacto de la sociedad.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', email: '', phone: '', role: '' })}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Contacto
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contacto Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="legal_representative">Representante Legal</Label>
                <Input id="legal_representative" placeholder="Ej. Juan Pérez" {...register('legal_representative')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="contacto@empresa.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      prefixValue={phoneCountryPrefix}
                      onPrefixChange={(val) => setValue('phone_country_prefix', val)}
                      phoneValue={field.value || ''}
                      onPhoneChange={field.onChange}
                      countries={countries}
                      id="phone"
                    />
                  )}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección Física</Label>
                <Input id="address" placeholder="Ej. Calle 50, Edificio Global Plaza..." {...register('address')} />
              </div>
            </div>

            {/* Contactos Adicionales */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">Contactos Adicionales</span>
                  </div>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg relative items-end bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input {...register(`additional_contacts.${index}.name` as const)} placeholder="Nombre" className="bg-white dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label>Correo</Label>
                      <Input type="email" {...register(`additional_contacts.${index}.email` as const)} placeholder="Correo" className="bg-white dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Controller
                        name={`additional_contacts.${index}.phone` as const}
                        control={control}
                        render={({ field: phoneField }) => (
                          <Controller
                            name={`additional_contacts.${index}.phone_country_prefix` as const}
                            control={control}
                            render={({ field: prefixField }) => (
                              <PhoneInput
                                prefixValue={prefixField.value || ''}
                                onPrefixChange={prefixField.onChange}
                                phoneValue={phoneField.value || ''}
                                onPhoneChange={phoneField.onChange}
                                countries={countries}
                              />
                            )}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol / Cargo</Label>
                      <div className="flex items-center gap-2">
                        <Controller
                          name={`additional_contacts.${index}.role` as const}
                          control={control}
                          render={({ field: roleField }) => (
                            <Select
                              value={roleField.value || ''}
                              onValueChange={(val) => roleField.onChange(val || '')}
                            >
                              <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                                <SelectValue placeholder="Selecciona un cargo..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[250px]" side="bottom" align="start" alignItemWithTrigger={false} sideOffset={4}>
                                {positions.map((pos) => (
                                  <SelectItem key={pos} value={pos}>
                                    {pos}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección 3: Información Administrativa */}
        <Card>
          <CardHeader>
            <CardTitle>Información Administrativa</CardTitle>
            <CardDescription>Control interno y cobros.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expedient_number">Número de Expediente</Label>
              <Input id="expedient_number" placeholder="Ej. EXP-2026-001" {...register('expedient_number')} />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Persona Jurídica</Label>
              <Controller
                name="legal_person_type"
                control={control}
                render={({ field }) => (
                  <Popover modal={false}>
                    <PopoverTrigger className="w-full justify-between inline-flex items-center border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <span className="truncate">
                        {field.value || "Selecciona un tipo..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-(--anchor-width) p-0" align="start" side="bottom" collisionAvoidance={{ side: 'none' }}>
                      <Command>
                        <CommandInput placeholder="Buscar tipo..." autoFocus={false} />
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                           <CommandGroup heading="Principales">
                            {legalPersonTypes.filter(t => t.is_common).map((type) => (
                              <CommandItem
                                key={type.name}
                                value={type.name}
                                onSelect={() => {
                                  field.onChange(type.name)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === type.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {type.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="Otros">
                            {legalPersonTypes.filter(t => !t.is_common).map((type) => (
                              <CommandItem
                                key={type.name}
                                value={type.name}
                                onSelect={() => {
                                  field.onChange(type.name)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === type.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {type.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>



            <div className="space-y-4 col-span-2">
              <Label>Registros Obligatorios</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="registered_mici">MICI</Label>
                    <p className="text-xs text-muted-foreground">Min. de Comercio</p>
                  </div>
                  <Controller
                    name="registered_mici"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="registered_mici"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="registered_rubf">RUBF</Label>
                    <p className="text-xs text-muted-foreground">Reg. Beneficiarios</p>
                  </div>
                  <Controller
                    name="registered_rubf"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="registered_rubf"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="registered_dgi">DGI</Label>
                    <p className="text-xs text-muted-foreground">Dir. de Ingresos</p>
                  </div>
                  <Controller
                    name="registered_dgi"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="registered_dgi"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observations">Observaciones Internas</Label>
              <Textarea id="observations" placeholder="Notas sobre la sociedad..." {...register('observations')} />
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Archivos */}
        <Card>
          <CardHeader>
            <CardTitle>Archivos</CardTitle>
            <CardDescription>Sube documentos y guárdalos antes de crear la sociedad.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploader onUploadComplete={(docs) => setValue('new_documents', docs)} />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/dashboard/sociedades" className={cn(buttonVariants({ variant: 'outline' }))}>
            Cancelar
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Sociedad'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
