import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConsentDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

// Texto provisório do termo (versão "v1" no backend). Revisar com a equipe antes de ir ao ar.
// Se o texto mudar, aumente CONSENT_VERSION no backend.
const ConsentDialog = ({ open, onOpenChange }: ConsentDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Termo de consentimento</DialogTitle>
        <DialogDescription>Leia com calma. Você só cria a conta se concordar.</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          O Econchego é um projeto acadêmico e social da UNESP de Bauru que acompanha gestantes e mães de bebês de
          até 1 ano.
        </p>
        <p>
          Para isso, guardamos seu nome, seu e-mail, a data prevista do parto ou a data de nascimento do bebê, o que
          você marca como feito no checklist, os conteúdos que conclui, suas dúvidas e avaliações e, se quiser
          informar, a sua UBS de referência.
        </p>
        <p>
          Esses dados são sobre saúde e, por isso, a LGPD os considera dados pessoais sensíveis. Usamos apenas para
          mostrar o conteúdo certo para a sua fase e para medir o impacto do projeto, com números agrupados e sem
          identificar ninguém.
        </p>
        <p>
          Você pode baixar os seus dados ou excluir a sua conta quando quiser, na tela de Perfil. Ao excluir, seus
          dados são apagados.
        </p>
        <p>
          O conteúdo do app é informativo e não substitui a consulta com profissionais de saúde.
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button className="w-full">Entendi</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export { ConsentDialog }
