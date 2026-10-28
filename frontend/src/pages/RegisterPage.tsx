import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ConsentDialog } from '@/components/ConsentDialog'
import { FormField } from '@/components/FormField'
import { PasswordToggle } from '@/components/PasswordToggle'
import { useAuth } from '@/hooks/useAuth'
import { addDays, toInputDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { getErrorMessage, getFieldErrors, type FieldErrors } from '@/services/api'
import type { RegisterInput } from '@/types/auth'

type Phase = RegisterInput['phase']

const PHASES: { value: Phase; label: string }[] = [
  { value: 'PREGNANT', label: 'Estou grávida' },
  { value: 'BABY', label: 'Meu bebê já nasceu' },
]

// Os limites ficam um pouco dentro dos do backend, para o fuso horário não causar recusa.
const getDateConfig = (phase: Phase) => {
  const today = new Date()

  if (phase === 'PREGNANT') {
    return {
      label: 'Data prevista do parto',
      hint: 'Está no cartão da gestante ou no resultado do ultrassom.',
      min: toInputDate(addDays(today, -55)),
      max: toInputDate(addDays(today, 290)),
    }
  }

  return {
    label: 'Data de nascimento do bebê',
    hint: 'Assim mostramos o que fazer a cada mês de vida.',
    min: toInputDate(addDays(today, -360)),
    max: toInputDate(today),
  }
}

const RegisterPage = () => {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phase, setPhase] = useState<Phase>('PREGNANT')
  const [date, setDate] = useState('')
  const [ubsReference, setUbsReference] = useState('')
  const [consent, setConsent] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const dateConfig = getDateConfig(phase)

  const handlePhaseChange = (next: Phase) => {
    setPhase(next)
    setDate('')
    setFieldErrors((errors) => ({ ...errors, dueDate: '', birthDate: '' }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!consent) {
      setFieldErrors({ consent: 'É necessário aceitar o termo para criar a conta.' })
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const payload: RegisterInput = {
      name: name.trim(),
      email: email.trim(),
      password,
      consent: true,
      phase,
      ...(date ? (phase === 'PREGNANT' ? { dueDate: date } : { birthDate: date }) : {}),
      ...(ubsReference.trim() ? { ubsReference: ubsReference.trim() } : {}),
    }

    try {
      await signUp(payload)
      // O PublicLayout leva para a Home assim que a sessão existe.
    } catch (error) {
      const errors = getFieldErrors(error)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Criar sua conta</CardTitle>
        <CardDescription>
          Conteúdo confiável e um checklist de consultas, exames e vacinas para a sua fase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField
            label="Nome"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={fieldErrors.name}
          />
          <FormField
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <FormField
            label="Senha"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="Mínimo de 8 caracteres."
            error={fieldErrors.password}
            adornment={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />}
          />

          <div className="space-y-1.5">
            <p className="text-sm font-medium leading-none" id="phase-label">
              Em que momento você está?
            </p>
            <div role="radiogroup" aria-labelledby="phase-label" className="grid grid-cols-2 gap-2">
              {PHASES.map((option) => {
                const selected = phase === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handlePhaseChange(option.value)}
                    className={cn(
                      'min-h-12 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <FormField
            key={phase}
            label={dateConfig.label}
            name="date"
            type="date"
            min={dateConfig.min}
            max={dateConfig.max}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            hint={dateConfig.hint}
            error={fieldErrors.dueDate || fieldErrors.birthDate}
          />

          <FormField
            label="UBS de referência (opcional)"
            name="ubsReference"
            value={ubsReference}
            onChange={(event) => setUbsReference(event.target.value)}
            hint="Ajuda o projeto a medir o impacto na sua região."
            error={fieldErrors.ubsReference}
          />

          <div className="space-y-1.5">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                aria-invalid={Boolean(fieldErrors.consent)}
                className="mt-0.5 size-5"
              />
              <label htmlFor="consent" className="text-sm leading-snug">
                Li e aceito o{' '}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="font-bold text-primary underline underline-offset-4"
                >
                  termo de consentimento
                </button>
                , inclusive o uso dos meus dados de saúde.
              </label>
            </div>
            {fieldErrors.consent ? (
              <p className="text-sm font-medium text-destructive">{fieldErrors.consent}</p>
            ) : null}
          </div>

          {formError ? (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            Criar conta
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="font-bold text-primary underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </CardContent>

      <ConsentDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </Card>
  )
}

export { RegisterPage }
