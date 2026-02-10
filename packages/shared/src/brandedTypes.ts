import { z } from "zod"

export const millisSchema = z.number().brand<"Millis", "inout">()
export type Millis = z.output<typeof millisSchema>
export const Millis = (n: number): Millis => millisSchema.parse(n)

export const urlSchema = z.string().brand<"Url", "inout">()
export type Url = z.output<typeof urlSchema>
export const Url = (s: string): Url => urlSchema.parse(s)

export const cloudflareAccountIdSchema = z.string().brand<"CloudflareAccountId", "inout">()
export type CloudflareAccountId = z.output<typeof cloudflareAccountIdSchema>
export const CloudflareAccountId = (s: string): CloudflareAccountId => cloudflareAccountIdSchema.parse(s)

export const cloudflareApiTokenSchema = z.string().brand<"CloudflareApiToken", "inout">()
export type CloudflareApiToken = z.output<typeof cloudflareApiTokenSchema>
export const CloudflareApiToken = (s: string): CloudflareApiToken => cloudflareApiTokenSchema.parse(s)

export const bucketNameSchema = z.string().brand<"BucketName", "inout">()
export type BucketName = z.output<typeof bucketNameSchema>
export const BucketName = (s: string): BucketName => bucketNameSchema.parse(s)

export const objectKeySchema = z.string().brand<"ObjectKey", "inout">()
export type ObjectKey = z.output<typeof objectKeySchema>
export const ObjectKey = (s: string): ObjectKey => objectKeySchema.parse(s)
