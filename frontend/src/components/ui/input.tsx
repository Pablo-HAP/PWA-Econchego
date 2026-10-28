import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<'input'> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-cyan-500',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
