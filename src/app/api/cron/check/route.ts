import { NextResponse } from 'next/server'
import { runDueChecks } from '@/lib/checker'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Called by the scheduler (GitHub Actions / Vercel Cron / scripts/worker.mjs) with the shared secret.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await runDueChecks({ limit: 100 })
  return NextResponse.json({ ...result, at: new Date().toISOString() })
}
