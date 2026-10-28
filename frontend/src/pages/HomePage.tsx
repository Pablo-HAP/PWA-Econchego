import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { describePhase } from '@/lib/phase'
import { api } from '@/services/api'
import type { ForMeResponse } from '@/types/content'

// Home provisória: confirma que login, token e busca de dados funcionam de ponta a ponta.
const HomePage = () => {
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['contents', 'for-me'],
    queryFn: () => api.get<ForMeResponse>('/contents/for-me'),
  })

  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Olá, {firstName}!</h1>

      {isPending ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : isError ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p>Não conseguimos carregar a sua semana agora.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-brand-orange/40 bg-accent/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Sua semana</p>
            <p className="text-4xl font-black text-primary">{describePhase(data.phase).title}</p>
            <p className="font-semibold">{describePhase(data.phase).subtitle}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {data.contents.length === 1
                ? '1 conteúdo para você agora.'
                : `${data.contents.length} conteúdos para você agora.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { HomePage }
