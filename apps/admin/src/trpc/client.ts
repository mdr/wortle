"use client"

import { createTRPCContext } from "@trpc/tanstack-react-query"

import type { AppRouter } from "./router"

export const { TRPCProvider: TRPCContextProvider, useTRPC } = createTRPCContext<AppRouter>()
