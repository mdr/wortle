import * as Sentry from "@sentry/react"

export interface Logger {
  readonly error: (code: string, message: string, extraFields?: Record<string, unknown>, exception?: unknown) => void
}

export class AppLogger implements Logger {
  error = (code: string, message: string, extraFields?: Record<string, unknown>, exception?: unknown): void => {
    const parts: unknown[] = [`[${code}]`, message]
    if (extraFields !== undefined) parts.push(extraFields)
    if (exception !== undefined) parts.push(exception)
    console.error(...parts)

    if (exception instanceof Error) {
      Sentry.captureException(exception, { extra: { code, message, ...extraFields } })
    } else {
      Sentry.captureMessage(message, { level: "error", extra: { code, ...extraFields } })
    }
  }
}

export const logger: Logger = new AppLogger()
