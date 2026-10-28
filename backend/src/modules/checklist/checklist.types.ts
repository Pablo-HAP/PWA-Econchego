import type { z } from "zod";
import type { updateChecklistSchema } from "./checklist.schemas";

// UPCOMING: ainda não chegou a janela | OPEN: dentro da janela
// OVERDUE: a janela passou e o item não foi feito | DONE: feito
export type ChecklistStatus = "UPCOMING" | "OPEN" | "OVERDUE" | "DONE";

export type UpdateChecklistInput = z.infer<typeof updateChecklistSchema>;