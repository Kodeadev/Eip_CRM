import { createClient } from '@/lib/supabase/server'
import { PaymentService } from '@/services/payment.service'
import { SocietyService } from '@/services/society.service'
import { PaymentForm } from '@/components/payments/payment-form'
import { notFound } from 'next/navigation'

export default async function EditarPagoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const paymentService = new PaymentService(supabase)
  const societyService = new SocietyService(supabase)

  let payment = null
  let societies: any[] = []

  try {
    payment = await paymentService.getPayment(id)
    societies = await societyService.listSocieties()
  } catch (error) {
    console.error('Error al obtener datos para edición:', error)
  }

  if (!payment) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Editar Cobro</h1>
        <p className="text-muted-foreground">Modifica los detalles del pago seleccionado.</p>
      </div>

      <PaymentForm societies={societies} initialData={payment} />
    </div>
  )
}
