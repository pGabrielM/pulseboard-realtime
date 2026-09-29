// Seeds (or resets) the demo account with 30 days of synthetic history.
// From then on the monitors are checked for real against the live URLs.
import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

config({ path: '.env.local', quiet: true })
config({ quiet: true })

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })
const DEMO = { email: 'demo@pulseboard.dev', password: 'demo1234', name: 'Equipe Ops' }
const STEP_MIN = 20
const DAYS = 90

let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const MONITORS = [
  { name: 'Portfólio letinfo.dev', url: 'https://www.letinfo.dev', base: 190, outages: [{ daysAgo: 4, minutes: 30, cause: 'Tempo limite excedido' }] },
  { name: 'Resume Score AI', url: 'https://resume.letinfo.dev', base: 230, outages: [{ daysAgo: 12, minutes: 45, cause: 'Status 502 (esperado 200)' }, { daysAgo: 21, minutes: 40, cause: 'Status 503 (esperado 200)' }, { daysAgo: 58, minutes: 180, cause: 'Status 500 (esperado 200)' }] },
  { name: 'GitHub API', url: 'https://api.github.com', base: 95, outages: [{ daysAgo: 71, minutes: 60, cause: 'Status 503 (esperado 200)' }] },
  { name: 'Google', url: 'https://www.google.com', base: 70, outages: [] },
  { name: 'Cloudflare', url: 'https://www.cloudflare.com', base: 85, outages: [{ daysAgo: 17, minutes: 15, cause: 'Conexão recusada' }] },
  { name: 'Gateway de pagamentos (homologação)', url: 'https://expired.badssl.com', base: 140, outages: [], downSinceMinutes: 95, downCause: 'Certificado SSL inválido' },
]

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO.email } })
  const user = await prisma.user.create({
    data: { email: DEMO.email, name: DEMO.name, passwordHash: await bcrypt.hash(DEMO.password, 10) },
  })

  const now = Date.now()
  const created = []
  for (const [index, spec] of MONITORS.entries()) {
    const down = Boolean(spec.downSinceMinutes)
    const monitor = await prisma.monitor.create({
      data: {
        ownerId: user.id,
        name: spec.name,
        url: spec.url,
        intervalSeconds: index === 5 ? 60 : 300,
        status: down ? 'DOWN' : 'UP',
        lastCheckedAt: new Date(now - 3 * 60000),
        lastLatencyMs: down ? null : spec.base,
        createdAt: new Date(now - DAYS * 86400000 + index * 1000),
      },
    })
    created.push(monitor)

    const windows = spec.outages.map((outage) => {
      const start = now - outage.daysAgo * 86400000 - Math.floor(rand() * 8) * 3600000
      return { start, end: start + outage.minutes * 60000, cause: outage.cause }
    })
    if (down) windows.push({ start: now - spec.downSinceMinutes * 60000, end: Infinity, cause: spec.downCause })

    const checks = []
    for (let t = now - DAYS * 86400000; t <= now - 3 * 60000; t += STEP_MIN * 60000) {
      const outage = windows.find((window) => t >= window.start && t < window.end)
      const hour = new Date(t).getHours()
      const load = hour >= 9 && hour <= 18 ? 1.25 : 1
      if (outage) {
        checks.push({ monitorId: monitor.id, checkedAt: new Date(t), ok: false, statusCode: outage.cause.startsWith('Status') ? Number(outage.cause.slice(7, 10)) : null, latencyMs: null, error: outage.cause })
      } else {
        const spike = rand() > 0.97 ? 2.5 + rand() * 2 : 1
        checks.push({ monitorId: monitor.id, checkedAt: new Date(t), ok: true, statusCode: 200, latencyMs: Math.round(spec.base * load * spike * (0.8 + rand() * 0.4)), error: null })
      }
    }
    await prisma.check.createMany({ data: checks })

    for (const window of windows) {
      await prisma.incident.create({
        data: {
          monitorId: monitor.id,
          startedAt: new Date(window.start),
          resolvedAt: window.end === Infinity ? null : new Date(window.end),
          cause: window.cause,
        },
      })
    }
  }

  await prisma.statusPage.create({
    data: {
      ownerId: user.id,
      slug: 'demo',
      title: 'Status — letinfo.dev',
      description: 'Disponibilidade dos serviços públicos, atualizada a cada 5 minutos.',
      monitors: { connect: created.slice(0, 5).map((monitor) => ({ id: monitor.id })) },
    },
  })

  console.log(`Demo account ready: ${DEMO.email} / ${DEMO.password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
