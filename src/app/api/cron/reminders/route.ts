import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ReminderEngineService } from '@/services/reminder-engine.service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    console.log('API Cron triggers reminder scanning...')
    
    // Optional auth header verification (if CRON_SECRET is configured)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.warn('Unauthorized cron trigger attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const engine = new ReminderEngineService(supabase)
    const result = await engine.processDueNotifications()

    if (!result.success) {
      throw new Error(result.error)
    }

    console.log(`Cron successfully processed due alerts. Sent: ${result.sent}`)
    return NextResponse.json({ success: true, sent: result.sent })
  } catch (err: any) {
    console.error('Error executing reminders cron API route:', err)
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 })
  }
}
