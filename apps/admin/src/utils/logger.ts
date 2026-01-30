export interface Logger {
  readonly info: (code: string, message: string, extraFields?: Record<string, unknown>) => void
  readonly warn: (code: string, message: string, extraFields?: Record<string, unknown>) => void
  readonly error: (code: string, message: string, extraFields?: Record<string, unknown>, exception?: unknown) => void
}

class ServerLogger implements Logger {
  info = (code: string, message: string, extraFields?: Record<string, unknown>): void => {
    const parts: unknown[] = [`[${code}]`, message]
    if (extraFields !== undefined) parts.push(extraFields)
    console.info(...parts)
  }

  warn = (code: string, message: string, extraFields?: Record<string, unknown>): void => {
    const parts: unknown[] = [`[${code}]`, message]
    if (extraFields !== undefined) parts.push(extraFields)
    console.warn(...parts)
  }

  error = (code: string, message: string, extraFields?: Record<string, unknown>, exception?: unknown): void => {
    const parts: unknown[] = [`[${code}]`, message]
    if (extraFields !== undefined) parts.push(extraFields)
    if (exception !== undefined) parts.push(exception)
    console.error(...parts)
  }
}

export const logger: Logger = new ServerLogger()
