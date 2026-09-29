import { auth } from '@/auth'
import { runDueChecks } from '@/lib/checker'
import { getMonitorRows } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TICK_MS = 5000
const LIFETIME_MS = 50_000

// Server-Sent Events: pushes a fresh snapshot whenever something changes. While a dashboard is
// open it also runs due checks for that user, so monitors stay fresh even without the cron.
export async function GET(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const encoder = new TextEncoder()
  let closed = false
  request.signal.addEventListener('abort', () => {
    closed = true
  })

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk))
      }
      const started = Date.now()
      let last = ''
      send('retry: 2000\n\n')

      while (!closed && Date.now() - started < LIFETIME_MS) {
        try {
          await runDueChecks({ ownerId: userId, limit: 10 })
          const rows = await getMonitorRows(userId)
          const payload = JSON.stringify(rows)
          if (payload !== last) {
            send(`event: monitors\ndata: ${payload}\n\n`)
            last = payload
          } else {
            send(': keep-alive\n\n')
          }
        } catch (error) {
          send(`event: problem\ndata: ${JSON.stringify(error instanceof Error ? error.message : 'erro')}\n\n`)
        }
        await new Promise((resolve) => setTimeout(resolve, TICK_MS))
      }
      if (!closed) controller.close()
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
