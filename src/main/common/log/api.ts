import log, { Logger } from 'electron-log'

log.transports.file.level = 'info';

class ElectronLogger {
    private static instance: ElectronLogger | null = null
    private logger: Logger | null = null

    private async initialize(): Promise<void> {
        try {
            log.initialize()
            this.logger = log
        } catch (error) {
            console.error('Failed to initialize logger:', error)
            this.logger = null
        }
    }

    static getInstance(): ElectronLogger {
        if (ElectronLogger.instance === null) {
            ElectronLogger.instance = new ElectronLogger()
            ElectronLogger.instance.initialize()
        }
        return ElectronLogger.instance
    }

    info(...messages: (string | object | Error)[]): void {
        this.logger?.info(...messages)
    }

    warn(...messages: (string | object | Error)[]): void {
        this.logger?.warn(...messages)
    }

    error(...messages: (string | object | Error)[]): void {
        this.logger?.error(...messages)
    }

    debug(...messages: (string | object | Error)[]): void {
        this.logger?.debug(...messages)
    }
}

export { ElectronLogger }
