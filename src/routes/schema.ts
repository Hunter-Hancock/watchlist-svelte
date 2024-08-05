import { z } from "zod";

export const addFormSchema = z.object({
  title: z.string().min(1, "You must add a title!"),
  type: z.number().min(1, "You must select a type!"),
  genre: z.number().min(1, "You must select a genre!"),
});

export type AddFormSchema = typeof addFormSchema;
