import type { ComponentProps, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string
  error?: string
  hint?: string
  // Elemento no canto direito do campo (ex.: botão de mostrar senha)
  adornment?: ReactNode
}

const FormField = ({ label, error, hint, adornment, id, name, className, ...props }: FormFieldProps) => {
  const fieldId = id ?? name
  const messageId = `${fieldId}-message`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn('h-11 text-base', adornment ? 'pr-12' : '', className)}
          {...props}
        />
        {adornment ? <div className="absolute inset-y-0 right-1 flex items-center">{adornment}</div> : null}
      </div>
      {error ? (
        <p id={messageId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
