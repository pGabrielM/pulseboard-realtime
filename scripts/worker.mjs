// Local scheduler: calls the cron endpoint every 30s, exactly like the production scheduler does.
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })
config({ quiet: true })

const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3103'}/api/cron/check`
const secret = process.env.CRON_SECRET
if (!secret) {
  console.error('CRON_SECRET is not set')
  process.exit(1)
}

async function tick() {
  try {
    const response = await fetch(url, { headers: { authorization: `Bearer ${secret}` } })
    const body = await response.json()
    console.log(new Date().toLocaleTimeString('pt-BR'), response.status, body)
  } catch (error) {
    console.error(new Date().toLocaleTimeString('pt-BR'), 'failed:', error.message)
  }
}

await tick()
setInterval(tick, 30_000)
