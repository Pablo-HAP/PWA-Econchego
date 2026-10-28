import type { z } from "zod";
import type { listContentsQuerySchema } from "./contents.schemas";

export type ListContentsQuery = z.infer<typeof listContentsQuerySchema>;