const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000)

// Formato yyyy-MM-dd no fuso local, que é o que o <input type="date"> espera.
const toInputDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)

export { addDays, toInputDate }
