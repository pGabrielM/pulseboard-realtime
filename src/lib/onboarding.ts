import 'server-only'

import { prisma } from '@/lib/prisma'

// New accounts start by monitoring a public site so the dashboard is never empty.
export async function onUserCreated(userId: string): Promise<void> {
  await prisma.monitor.create({
    data: { ownerId: userId, name: 'GitHub', url: 'https://github.com', intervalSeconds: 300 },
  })
}
