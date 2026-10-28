import * as React from 'react'
import { cn } from '../../lib/utils'

export function Modal({ open = true, onClose, children }: { open?: boolean; onClose?: () => void; children: React.ReactNode }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-md p-4')}>{children}</div>
    </div>
  )
}

export default Modal
