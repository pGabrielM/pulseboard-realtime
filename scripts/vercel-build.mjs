// Vercel build: generates the Prisma client; on production builds applies pending
// migrations and seeds the demo workspace when the database is brand new.
import { execSync } from 'node:child_process'
import pg from 'pg'

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

run('npx --no-install prisma generate')

if (process.env.VERCEL_ENV === 'production' && process.env.DATABASE_URL) {
  // Neon: migrations need the direct (non-pooled) connection when it is provided.
  const direct = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  const client = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const { rows } = await client.query("select to_regclass('public._prisma_migrations') as t")
  await client.end()
  const fresh = rows[0].t === null

  run('npx --no-install prisma migrate deploy', { DATABASE_URL: direct })
  if (fresh) {
    console.log('New database detected: seeding demo data')
    run('npx --no-install prisma db seed', { DATABASE_URL: direct })
  }
}
