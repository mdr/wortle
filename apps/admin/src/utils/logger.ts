class ServerLogger {
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

class ClientLogger {
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

export const serverLogger = new ServerLogger()
export const clientLogger = new ClientLogger()
