import { createClient } from '@/lib/supabase/server'
import { SocietyService } from '@/services/society.service'
import { PaymentService } from '@/services/payment.service'
import { userService } from '@/services/user.service'
import { notFound } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Calendar, FileText, History, Building, Phone, Mail, MapPin, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre de la Sociedad',
  internal_id: 'Identificador Interno',
  ruc: 'RUC',
  dv: 'DV',
  folio_number: 'Número de Folio',
  constitution_date: 'Fecha de Constitución',
  legal_person_type: 'Tipo de Persona Jurídica',
  status: 'Estado',
  legal_representative: 'Representante Legal',
  email: 'Correo Electrónico',
  phone: 'Teléfono',
  phone_country_prefix: 'Prefijo de Teléfono',
  address: 'Dirección Física',
  expedient_number: 'Número de Expediente',
  observations: 'Observaciones',
  registered_mici: 'Registro MICI',
  registered_rubf: 'Registro RUBF',
  registered_dgi: 'Registro DGI'
}

export default async function DetalleSociedadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const societyService = new SocietyService(supabase)
  const paymentService = new PaymentService(supabase)
  
  let society = null
  let documents: any[] = []
  let payments: any[] = []
  let historyLogs: any[] = []
  let usersList: any[] = []
  try {
    society = await societyService.getSociety(id)
    documents = await societyService.getDocuments(id)
    payments = await paymentService.getPaymentsBySociety(id)
    historyLogs = await societyService.getHistory(id)
    
    try {
      usersList = await userService.listUsers()
    } catch (userErr) {
      console.warn('Could not load users list for history mapping', userErr)
    }

    // Buscar documentos para cada pago
    for (const payment of payments) {
      payment.documents = await paymentService.getDocuments(payment.id)
    }
  } catch (error) {
    console.error('Error al obtener sociedad o documentos:', error)
  }

  if (!society) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sociedades" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{society.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                society.status === 'activa' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                society.status === 'suspendida' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                society.status === 'en trámite' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
              }`}>
                {society.status}
              </span>
              <span className="text-sm text-muted-foreground">RUC: {society.ruc || 'N/D'}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/sociedades/${society.id}/editar`}
          className={cn(buttonVariants({ variant: 'outline' }), "flex items-center gap-2")}
        >
          <Edit className="h-4 w-4" />
          Editar Sociedad
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="detalle" className="w-full">
            <TabsList className="flex w-full overflow-x-auto h-auto min-h-9 p-[3px] justify-start sm:justify-center gap-1.5 no-scrollbar">
              <TabsTrigger value="detalle">Detalles</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="detalle" className="mt-6 space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium">{society.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Identificador Interno</p>
                    <p className="font-medium">{society.internal_id || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RUC / DV</p>
                    <p className="font-medium">{society.ruc || 'N/D'} - {society.dv || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número de Folio</p>
                    <p className="font-medium">{society.folio_number || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha de Constitución</p>
                    <p className="font-medium">{society.constitution_date || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usuario Creador</p>
                    <p className="font-medium">
                      {society.created_by ? (usersList.find((u) => u.id === society.created_by)?.name || 'Cargando...') : 'Sin asignar'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo de Persona Jurídica</p>
                    <p className="font-medium">{society.legal_person_type || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número de Expediente</p>
                    <p className="font-medium">{society.expedient_number || 'N/D'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Representante Legal</p>
                    <p className="font-medium">{society.legal_representative || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Correo Electrónico</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {society.email || 'N/D'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {society.phone_country_prefix ? `${society.phone_country_prefix} ` : ''}{society.phone || 'N/D'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Dirección Física</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {society.address || 'N/D'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contactos Adicionales */}
              {society.additional_contacts && society.additional_contacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contactos Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {society.additional_contacts.map((contact: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-muted-foreground">Nombre</p>
                          <p className="font-medium">{contact.name || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rol</p>
                          <p className="font-medium">{contact.role || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Correo</p>
                          <p className="font-medium">{contact.email || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{contact.phone || 'N/D'}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documentos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Documentos Adjuntos
                  </CardTitle>
                  <CardDescription>Archivos y documentos legales de la sociedad.</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                {doc.file_size && <span>• {(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>}
                              </div>
                            </div>
                          </div>
                          {doc.signed_url ? (
                            <a
                              href={doc.signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "shrink-0")}
                            >
                              Ver / Descargar
                            </a>
                          ) : (
                            <span className="text-xs text-red-500">Error de acceso</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No hay documentos cargados todavía.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    Historial de Cobros
                  </CardTitle>
                  <CardDescription>Registro de tasas anuales y otros pagos realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments && payments.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                      {payments.map((payment: any, index: number) => (
                        <div key={payment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Icono central */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-shrink-0">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          
                          {/* Tarjeta del pago */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative group-hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-lg flex items-center gap-2">
                                ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                                  payment.payment_method === 'transferencia' ? 'bg-blue-100 text-blue-700' :
                                  payment.payment_method === 'tarjeta' ? 'bg-purple-100 text-purple-700' :
                                  payment.payment_method === 'efectivo' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {payment.payment_method}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {payment.year || new Date(payment.payment_date).getFullYear()}
                                </span>
                                <Link href={`/dashboard/pagos/${payment.id}/editar`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-7 w-7")}>
                                  <Edit className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{payment.description || 'Pago de tasa anual'}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Fecha de Pago</p>
                                <p className="font-medium">{payment.payment_date}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Próximo Vencimiento</p>
                                <p className="font-medium text-amber-600">{payment.next_due_date || 'N/D'}</p>
                              </div>
                              <div className="col-span-2 mt-1 pt-2 border-t">
                                <p className="text-muted-foreground">Referencia</p>
                                <p className="font-medium truncate">{payment.reference_number || 'Sin referencia'}</p>
                              </div>
                            </div>

                            {/* Documentos del pago */}
                            {payment.documents && payment.documents.length > 0 && (
                              <div className="mt-4 pt-3 border-t">
                                <p className="text-xs font-semibold mb-2">Comprobantes:</p>
                                <div className="space-y-2">
                                  {payment.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
                                      <span className="truncate pr-2">{doc.name}</span>
                                      {doc.signed_url && (
                                        <a href={doc.signed_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline whitespace-nowrap">
                                          Ver
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No se han registrado cobros para esta sociedad.</p>
                      <Link href="/dashboard/pagos/nuevo" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mt-4")}>
                        Registrar un pago
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historial" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Historial de Cambios
                  </CardTitle>
                  <CardDescription>Registro de actividades y modificaciones de esta sociedad.</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No hay historial registrado todavía.</p>
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8 py-2">
                      {historyLogs.map((log) => {
                        const userName = usersList.find((u) => u.id === log.user_id)?.name || 'Sistema'
                        const isCreation = log.action === 'Creación de Sociedad'
                        const logDate = new Date(log.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })

                        return (
                          <div key={log.id} className="relative group">
                            {/* Círculo indicador */}
                            <span className={cn(
                              "absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-slate-950 text-xs shadow-sm ring-4 ring-white dark:ring-slate-900 transition-colors",
                              isCreation 
                                ? "border-green-200 text-green-600 dark:border-green-900/30" 
                                : "border-blue-200 text-blue-600 dark:border-blue-900/30"
                            )}>
                              {isCreation ? (
                                <Building className="h-3 w-3" />
                              ) : (
                                <Edit className="h-3 w-3" />
                              )}
                            </span>

                            {/* Contenido del evento */}
                            <div className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                  {log.action}
                                </h4>
                                <time className="text-xs text-muted-foreground whitespace-nowrap">
                                  {logDate}
                                </time>
                              </div>
                              
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="font-medium text-slate-600 dark:text-slate-400">{userName}</span>
                              </p>

                              {/* Cambios detallados */}
                              {log.changes && Object.keys(log.changes).length > 0 && (
                                <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50 space-y-1.5">
                                  {Object.entries(log.changes).map(([key, value]: [string, any]) => {
                                    const label = FIELD_LABELS[key] || key
                                    
                                    // Formateador especial para booleanos
                                    const formatVal = (val: any) => {
                                      if (val === true || val === 'true') return 'Registrado'
                                      if (val === false || val === 'false') return 'Pendiente'
                                      if (val === 'N/D') return 'N/D'
                                      return String(val)
                                    }

                                    return (
                                      <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                          {label}:
                                        </span>
                                        <span className="flex items-center gap-1.5 flex-wrap">
                                          {value.old !== null && value.old !== undefined && value.old !== 'N/D' ? (
                                            <>
                                              <span className="line-through text-red-500 bg-red-50 dark:bg-red-950/20 px-1 rounded">
                                                {formatVal(value.old)}
                                              </span>
                                              <span>→</span>
                                            </>
                                          ) : null}
                                          <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-1 rounded font-medium">
                                            {formatVal(value.new)}
                                          </span>
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Tarjeta de Cobros */}
          <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Control de Cobros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Último Pago</p>
                <p className="font-medium">{society.last_payment_date || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próximo Pago</p>
                <p className="font-bold text-primary text-lg">{society.next_payment_date || 'No registrado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Registros Obligatorios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros Obligatorios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>MICI</span>
                {society.registered_mici ? (
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Registrado</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500"><XCircle className="h-4 w-4" /> Pendiente</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>RUBF</span>
                {society.registered_rubf ? (
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Registrado</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500"><XCircle className="h-4 w-4" /> Pendiente</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>DGI</span>
                {society.registered_dgi ? (
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Registrado</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500"><XCircle className="h-4 w-4" /> Pendiente</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
