import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

const { electron } = window
const { ipcRenderer } = electron

function App(): JSX.Element {
    const [process, setProcess] = useState(0)
    const ipcHandle = (): void => ipcRenderer.send('ping')

    useEffect(() => {
        ipcRenderer.on('update_available', () => {
            // 提示用户有更新可用
            console.log('Update available')
        })

        ipcRenderer.on('update_downloaded', () => {
            // 提示用户更新已下载，可以重启应用
            console.log('Update downloaded')
            if (confirm('A new version has been downloaded. Restart the application to apply the updates?')) {
                ipcRenderer.send('restart_app')
            }
        })

        ipcRenderer.on('download-progress', (event, { bytesPerSecond, delta, percent, total, transferred }) => {
            console.log('Update Process::', { bytesPerSecond, delta, percent, total, transferred })
            setProcess(percent)
        })

        return (): void => {
            ipcRenderer.removeAllListeners('update_available')
            ipcRenderer.removeAllListeners('download-progress')
            ipcRenderer.removeAllListeners('update_downloaded')
        }
    }, [])

    return (
        <>
            <img alt="logo" className="logo" src={electronLogo} />
            <div className="creator">Powered by electron-vite</div>
            <div className="text">
                Build an Electron app with <span className="react">React</span>
                &nbsp;and <span className="ts">TypeScript</span>
            </div>
            <p className="tip">
                Please try pressing <code>F12</code> to open the devTool
            </p>
            <div className="actions">
                <div className="action">
                    <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
                        Documentation
                    </a>
                </div>
                <div className="action">
                    <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
                        Send IPC
                    </a>
                </div>
            </div>
            <Versions></Versions>
            <div>Process::{process}</div>
        </>
    )
}

export default App
