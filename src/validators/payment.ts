import { z } from 'zod'

export const paymentSchema = z.object({
  society_id: z.string({
    message: "Debe seleccionar una sociedad",
  }).uuid("ID de sociedad inválido"),
  
  payment_date: z.string({
    message: "La fecha de pago es requerida",
  }).min(1, "La fecha de pago es requerida"),
  
  next_due_date: z.string({
    message: "La fecha de próximo cobro es requerida",
  }).min(1, "La fecha de próximo cobro es requerida"),
  
  amount: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((val) => val >= 0, "El monto no puede ser negativo")
    .optional()
    .default(0),
  
  payment_method: z.string().optional(),
  
  notes: z.string().optional(),

  new_documents: z.array(z.object({
    name: z.string(),
    file_path: z.string(),
    file_type: z.string().optional(),
    file_size: z.number().optional(),
  })).optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
