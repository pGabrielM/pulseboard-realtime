'use client'

import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { saveStatusPage } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

type Page = { id: string; title: string; slug: string; description: string | null; monitors: { id: string }[] }

export function StatusPageForm({ monitors, page }: { monitors: { id: string; name: string }[]; page?: Page }) {
  const [open, setOpen] = useState(false)
  const { pending, run } = useAction()
  const selected = new Set(page?.monitors.map((monitor) => monitor.id) ?? monitors.map((monitor) => monitor.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {page ? (
          <Button variant="secondary" size="sm">
            <Pencil /> Editar
          </Button>
        ) : (
          <Button>
            <Plus /> Nova página
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={page ? 'Editar página de status' : 'Nova página de status'} description="Página pública para clientes acompanharem a disponibilidade.">
        <form
          className="space-y-4"
          action={(formData) =>
            run(() => saveStatusPage(page?.id ?? null, formData), { success: 'Página salva.', onSuccess: () => setOpen(false) })
          }
        >
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={page?.title} placeholder="Status — Minha Empresa" required />
          </div>
          <div>
            <Label htmlFor="slug">Endereço</Label>
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 pl-3 shadow-sm focus-within:border-brand-500">
              <span className="text-sm text-zinc-500">/status/</span>
              <input id="slug" name="slug" defaultValue={page?.slug} required className="h-9 flex-1 rounded-r-lg bg-white px-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" defaultValue={page?.description ?? ''} placeholder="Opcional" />
          </div>
          <fieldset>
            <legend className="field-label">Monitores exibidos</legend>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2">
              {monitors.map((monitor) => (
                <label key={monitor.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50">
                  <input type="checkbox" name="monitorIds" value={monitor.id} defaultChecked={selected.has(monitor.id)} className="size-4 accent-brand-600" />
                  {monitor.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
