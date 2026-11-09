"use client"

import { createTRPCReact } from "@trpc/react-query"

import type { AppRouter } from "./router"

// TODO: migrate to @trpc/tanstack-react-query; @trpc/react-query is deprecated (bug fixes only) as of tRPC 11.25
// eslint-disable-next-line @typescript-eslint/no-deprecated
export const trpc = createTRPCReact<AppRouter>()
