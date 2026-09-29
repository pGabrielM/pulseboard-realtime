'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import type { ActionResult } from '@/lib/actions'

// Runs a server action, surfaces errors as toasts and reports success to the caller.
export function useAction() {
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<ActionResult | void>, options?: { success?: string; onSuccess?: () => void }) {
    startTransition(async () => {
      const result = await action()
      if (result && !result.ok) {
        toast.error(result.error)
        return
      }
      if (options?.success) toast.success(options.success)
      options?.onSuccess?.()
    })
  }

  return { pending, run }
}
