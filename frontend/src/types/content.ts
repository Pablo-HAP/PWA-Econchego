import type { UserPhase } from './phase'

export type ContentSummary = {
  id: string
  title: string
  summary: string
  type: 'TEXT' | 'VIDEO'
  stage: 'PRENATAL' | 'PARTO' | 'POSPARTO' | 'PRIMEIRO_ANO'
  weekStart: number | null
  weekEnd: number | null
  monthStart: number | null
  monthEnd: number | null
  validated: boolean
  category: { name: string; slug: string }
  completed: boolean
}

export type ForMeResponse = {
  phase: UserPhase
  contents: ContentSummary[]
}
