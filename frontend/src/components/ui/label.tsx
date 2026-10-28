import * as React from 'react'
import { cn } from '../../lib/utils'

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
  <label className={cn('block text-sm font-medium text-slate-700', className)} {...props}>
    {children}
  </label>
  )
}
