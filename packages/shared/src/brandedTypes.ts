import { z } from "zod"

export const urlSchema = z.string().brand<"Url", "inout">()
export type Url = z.output<typeof urlSchema>
export const Url = (s: string): Url => urlSchema.parse(s)
