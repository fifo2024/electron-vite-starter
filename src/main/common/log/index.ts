import { ElectronLogger } from './api'

export type LogType = 'error' | 'warn' | 'info' | 'debug'
export interface LogParams {
    type: LogType
    value: string
    from?: string
}

let loggerInstance: ElectronLogger | null = null

const ElectronLoggerInstance = (): ElectronLogger => {
    if (!loggerInstance) {
        loggerInstance = ElectronLogger.getInstance()
        console.log('loggerInstance', loggerInstance)
    }
    return loggerInstance
}

export const eLog = {
    info: (...messages: (string | object | Error)[]): void => {
        ElectronLoggerInstance().info(...messages)
    },
    warn: (...messages: (string | object | Error)[]): void => {
        ElectronLoggerInstance().warn(...messages)
    },
    error: (...messages: (string | object | Error)[]): void => {
        ElectronLoggerInstance().error(...messages)
    },
    debug: (...messages: (string | object | Error)[]): void => {
        ElectronLoggerInstance().debug(...messages)
    },
}
