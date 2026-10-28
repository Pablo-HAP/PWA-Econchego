import type { z } from "zod";
import type {
	contentInputSchema,
	listAdminContentsQuerySchema,
	validateContentSchema,
} from "./admin.schemas";

type ContentInput = z.infer<typeof contentInputSchema>;
type ValidateContentInput = z.infer<typeof validateContentSchema>;
type ListAdminContentsQuery = z.infer<typeof listAdminContentsQuerySchema>;

// Uma meta do projeto no painel. "met" fica null quando não dá para medir pelo app.
type MetricGoal = {
	key: string;
	label: string;
	target: number;
	unit: "ratio" | "stars" | "count" | "variation";
	value: number | null;
	met: boolean | null;
	manual?: boolean;
};

type BugMonth = { month: string; opened: number; resolved: number };

export type { BugMonth, ContentInput, ListAdminContentsQuery, MetricGoal, ValidateContentInput };
