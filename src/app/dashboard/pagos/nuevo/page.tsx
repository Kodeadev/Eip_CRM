import { handleListSocieties } from '@/controllers/society.controller'
import { PaymentForm } from '@/components/payments/payment-form'

export const dynamic = 'force-dynamic'

export default async function NuevoPagoPage() {
  const result = await handleListSocieties()
  const societies = result.success ? result.data : []

  return (
    <div className="max-w-3xl mx-auto py-6">
      <PaymentForm societies={societies || []} />
    </div>
  )
}
