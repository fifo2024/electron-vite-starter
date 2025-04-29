const { electron } = window
const { ipcRenderer } = electron

export const eLog = {
    info: (value: string): void => {
        ipcRenderer.send('eLog', { type: 'info', value, from: 'render' })
    },
    warn: (value: string): void => {
        ipcRenderer.send('eLog', { type: 'warn', value })
    },
    error: (value: string): void => {
        ipcRenderer.send('eLog', { type: 'error', value })
    },
    debug: (value: string): void => {
        ipcRenderer.send('eLog', { type: 'debug', value })
    },
}
