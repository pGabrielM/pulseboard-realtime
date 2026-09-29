'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { checkMonitor } from '@/lib/checker'
import { INTERVALS } from '@/lib/intervals'
import { assertPublicUrl } from '@/lib/net-guard'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { slugify } from '@/lib/utils'

export type ActionResult = { ok: true } | { ok: false; error: string }
const fail = (error: string): ActionResult => ({ ok: false, error })

const monitorSchema = z.object({
  name: z.string().trim().min(2, 'Dê um nome ao monitor.').max(80),
  url: z.string().trim().url('Informe uma URL válida, com https://').max(500),
  method: z.enum(['GET', 'HEAD']).default('GET'),
  expectedStatus: z.coerce.number().int().min(100).max(599).default(200),
  keyword: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || null),
  intervalSeconds: z.coerce.number().refine((value) => INTERVALS.some((item) => item.value === value), 'Intervalo inválido.'),
  timeoutMs: z.coerce.number().int().min(1000).max(30000).default(10000),
})

async function validate(formData: FormData) {
  const parsed = monitorSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }
  try {
    await assertPublicUrl(parsed.data.url)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'URL inválida.' }
  }
  return { data: parsed.data }
}

export async function createMonitor(formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const { data, error } = await validate(formData)
  if (!data) return fail(error!)
  const monitor = await prisma.monitor.create({ data: { ...data, ownerId: user.id } })
  await checkMonitor(monitor)
  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function updateMonitor(monitorId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const { data, error } = await validate(formData)
  if (!data) return fail(error!)
  const updated = await prisma.monitor.updateMany({ where: { id: monitorId, ownerId: user.id }, data })
  if (updated.count === 0) return fail('Monitor não encontrado.')
  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function deleteMonitor(monitorId: string): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.monitor.deleteMany({ where: { id: monitorId, ownerId: user.id } })
  revalidatePath('/app', 'layout')
  redirect('/app')
}

export async function setPaused(monitorId: string, paused: boolean): Promise<ActionResult> {
  const user = await requireUser()
  const monitor = await prisma.monitor.findFirst({ where: { id: monitorId, ownerId: user.id } })
  if (!monitor) return fail('Monitor não encontrado.')
  await prisma.$transaction([
    prisma.monitor.update({ where: { id: monitorId }, data: { status: paused ? 'PAUSED' : 'PENDING' } }),
    // Pausing closes any open incident: the downtime is no longer being measured.
    ...(paused ? [prisma.incident.updateMany({ where: { monitorId, resolvedAt: null }, data: { resolvedAt: new Date() } })] : []),
  ])
  if (!paused) await checkMonitor({ ...monitor, status: 'PENDING' })
  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function checkNow(monitorId: string): Promise<ActionResult> {
  const user = await requireUser()
  const monitor = await prisma.monitor.findFirst({ where: { id: monitorId, ownerId: user.id } })
  if (!monitor) return fail('Monitor não encontrado.')
  if (monitor.status === 'PAUSED') return fail('Retome o monitor para checar.')
  const result = await checkMonitor(monitor)
  revalidatePath('/app', 'layout')
  return result.ok ? { ok: true } : fail(`Falhou: ${result.error}`)
}

const statusPageSchema = z.object({
  title: z.string().trim().min(2, 'Dê um título à página.').max(80),
  slug: z
    .string()
    .trim()
    .transform((value) => slugify(value))
    .pipe(z.string().min(3, 'O endereço precisa ter pelo menos 3 caracteres.')),
  description: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value) => value || null),
})

export async function saveStatusPage(pageId: string | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = statusPageSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)
  const monitorIds = formData.getAll('monitorIds').map(String)
  const owned = await prisma.monitor.findMany({ where: { id: { in: monitorIds }, ownerId: user.id }, select: { id: true } })

  const clash = await prisma.statusPage.findUnique({ where: { slug: parsed.data.slug } })
  if (clash && clash.id !== pageId) return fail('Esse endereço já está em uso.')

  if (pageId) {
    const page = await prisma.statusPage.findFirst({ where: { id: pageId, ownerId: user.id } })
    if (!page) return fail('Página não encontrada.')
    await prisma.statusPage.update({ where: { id: pageId }, data: { ...parsed.data, monitors: { set: owned } } })
  } else {
    await prisma.statusPage.create({ data: { ...parsed.data, ownerId: user.id, monitors: { connect: owned } } })
  }
  revalidatePath('/app/status-pages')
  return { ok: true }
}

export async function deleteStatusPage(pageId: string): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.statusPage.deleteMany({ where: { id: pageId, ownerId: user.id } })
  revalidatePath('/app/status-pages')
  return { ok: true }
}
