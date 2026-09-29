'use client'

import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input, Label, Select } from '@/components/ui/input'
import { createMonitor, updateMonitor } from '@/lib/actions'
import { INTERVALS } from '@/lib/intervals'
import { useAction } from '@/lib/use-action'

type MonitorValues = {
  id: string
  name: string
  url: string
  method: 'GET' | 'HEAD'
  expectedStatus: number
  keyword: string | null
  intervalSeconds: number
  timeoutMs: number
}

export function MonitorForm({ monitor }: { monitor?: MonitorValues }) {
  const [open, setOpen] = useState(false)
  const { pending, run } = useAction()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {monitor ? (
          <Button variant="secondary">
            <Pencil /> Editar
          </Button>
        ) : (
          <Button>
            <Plus /> Novo monitor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={monitor ? 'Editar monitor' : 'Novo monitor'} description="Checamos a URL no intervalo escolhido e avisamos quando ela cai.">
        <form
          className="space-y-4"
          action={(formData) =>
            run(() => (monitor ? updateMonitor(monitor.id, formData) : createMonitor(formData)), {
              success: monitor ? 'Monitor atualizado.' : 'Monitor criado e verificado.',
              onSuccess: () => setOpen(false),
            })
          }
        >
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={monitor?.name} placeholder="Site da empresa" required />
          </div>
          <div>
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" defaultValue={monitor?.url} placeholder="https://exemplo.com.br" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="intervalSeconds">Intervalo</Label>
              <Select id="intervalSeconds" name="intervalSeconds" defaultValue={monitor?.intervalSeconds ?? 300}>
                {INTERVALS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Método</Label>
              <Select id="method" name="method" defaultValue={monitor?.method ?? 'GET'}>
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="expectedStatus">Status esperado</Label>
              <Input id="expectedStatus" name="expectedStatus" type="number" min={100} max={599} defaultValue={monitor?.expectedStatus ?? 200} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <Label htmlFor="keyword">Palavra-chave na página</Label>
              <Input id="keyword" name="keyword" defaultValue={monitor?.keyword ?? ''} placeholder="Opcional — ex.: Comprar" />
            </div>
            <div>
              <Label htmlFor="timeoutMs">Timeout (ms)</Label>
              <Input id="timeoutMs" name="timeoutMs" type="number" min={1000} max={30000} step={500} defaultValue={monitor?.timeoutMs ?? 10000} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Verificando…' : monitor ? 'Salvar' : 'Criar monitor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
