import type { UserPhase } from '@/types/phase'

// Texto da fase da usuária. A fase vem calculada do backend (campo "phase").
const describePhase = (phase: UserPhase) => {
  switch (phase.kind) {
    case 'PREGNANT':
      return { title: `${phase.week}ª semana`, subtitle: 'de gestação' }
    case 'BABY':
      if (phase.months === 0) {
        return { title: 'Recém-nascido', subtitle: 'primeiro mês de vida' }
      }
      return {
        title: `${phase.months} ${phase.months === 1 ? 'mês' : 'meses'}`,
        subtitle: 'de vida do bebê',
      }
    default:
      return { title: 'Sua jornada', subtitle: 'informe uma data no perfil' }
  }
}

export { describePhase }
