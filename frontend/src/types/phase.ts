export type UserPhase =
  | { kind: 'PREGNANT'; week: number; pastDue: boolean }
  | { kind: 'BABY'; months: number }
  | { kind: 'UNKNOWN' }
