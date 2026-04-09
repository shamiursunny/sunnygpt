// Structured logging utility
// Built by Shamiur Rashid Sunny (shamiur.com)

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
    [key: string]: any
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const logData = {
        timestamp,
        level,
        message,
        ...context
    }
    return JSON.stringify(logData)
}

export const logger = {
    info: (message: string, context?: LogContext) => {
        if (process.env.NODE_ENV === 'production') {
            console.log(formatLog('info', message, context))
        } else {
            console.log(`[INFO] ${message}`, context || '')
        }
    },

    warn: (message: string, context?: LogContext) => {
        if (process.env.NODE_ENV === 'production') {
            console.warn(formatLog('warn', message, context))
        } else {
            console.warn(`[WARN] ${message}`, context || '')
        }
    },

    error: (message: string, error?: Error, context?: LogContext) => {
        const errorContext = {
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : undefined
        }

        if (process.env.NODE_ENV === 'production') {
            console.error(formatLog('error', message, errorContext))
        } else {
            console.error(`[ERROR] ${message}`, error, context || '')
        }
    },

    debug: (message: string, context?: LogContext) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${message}`, context || '')
        }
    }
}
