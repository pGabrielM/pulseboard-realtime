import { config } from 'dotenv'
import pg from 'pg'

config({ path: '.env.local', quiet: true })
config({ quiet: true })

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

for (let attempt = 1; attempt <= 30; attempt++) {
  const client = new pg.Client({ connectionString: url })
  try {
    await client.connect()
    await client.end()
    console.log('Database is ready')
    process.exit(0)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

console.error('Database did not become ready in time')
process.exit(1)
